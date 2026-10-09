"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import {
  JOURS_PROLONGATION,
  PRIX_PROLONGATION,
  STATUTS_LOCATION_PAYEE,
  dateApresProlongation,
} from "@/lib/dureeAnnonce";
import { JOURS_MISE_EN_AVANT, dateApresMiseEnAvant, prixMiseEnAvant } from "@/lib/miseEnAvant";
import { JOURS_ENTRE_MISES_EN_AVANT_OFFERTES, estProActif } from "@/lib/abonnementPro";
import { lireModesRemise } from "@/lib/livraison";
import { FORMULES_PROMOTION, estFormule } from "@/lib/promotionReseaux";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Prolonge une annonce de 30 jours (voir src/lib/dureeAnnonce.ts) : gratuit
// si l'objet a déjà été loué, sinon paiement de 2 € par Stripe Checkout ;
// la prolongation est alors appliquée par le webhook Stripe.
export async function prolongerAnnonce(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/connexion?redirect=/membre/mes-annonces");

  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!annonce || annonce.proprietaireId !== user.id || annonce.statut !== "EN_LIGNE" || !annonce.enLigneJusquau) {
    redirect("/membre/mes-annonces?erreur=Cette+annonce+ne+peut+pas+%C3%AAtre+prolong%C3%A9e.");
  }

  const dejaLouee = await prisma.booking.count({
    where: { listingId: annonce.id, statut: { in: STATUTS_LOCATION_PAYEE } },
  });

  if (dejaLouee > 0) {
    await prisma.listing.update({
      where: { id: annonce.id },
      data: { enLigneJusquau: dateApresProlongation(annonce.enLigneJusquau, new Date()) },
    });
    revalidatePath("/membre/mes-annonces");
    revalidatePath("/", "layout");
    redirect("/membre/mes-annonces?prolongee=gratuite");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(PRIX_PROLONGATION * 100),
          product_data: {
            name: `Prolongation de ${JOURS_PROLONGATION} jours`,
            description: `Annonce « ${annonce.titre} »`,
          },
        },
      },
    ],
    // Repris par le webhook (payment_intent.succeeded) pour prolonger l'annonce.
    payment_intent_data: {
      metadata: { type: "prolongation_annonce", listingId: annonce.id },
    },
    success_url: `${siteUrl}/membre/mes-annonces?prolongee=payee`,
    cancel_url: `${siteUrl}/membre/mes-annonces`,
  });

  if (!session.url) {
    redirect("/membre/mes-annonces?erreur=Le+paiement+n%27a+pas+pu+d%C3%A9marrer.");
  }
  redirect(session.url);
}

// Service payant « annonce mise en avant » (voir src/lib/miseEnAvant.ts) :
// paiement par Stripe Checkout ; la mise en avant est appliquée par le
// webhook Stripe une fois le paiement reçu.
export async function mettreEnAvant(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/connexion?redirect=/membre/mes-annonces");

  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!annonce || annonce.proprietaireId !== user.id || annonce.statut !== "EN_LIGNE") {
    redirect("/membre/mes-annonces?erreur=Seule+une+annonce+en+ligne+peut+%C3%AAtre+mise+en+avant.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(prixMiseEnAvant(annonce) * 100),
          product_data: {
            name: `Annonce mise en avant ${JOURS_MISE_EN_AVANT} jours`,
            description: `Annonce « ${annonce.titre} »`,
          },
        },
      },
    ],
    // Repris par le webhook (payment_intent.succeeded).
    payment_intent_data: {
      metadata: { type: "mise_en_avant", listingId: annonce.id },
    },
    success_url: `${siteUrl}/membre/mes-annonces?enavant=1`,
    cancel_url: `${siteUrl}/membre/mes-annonces`,
  });

  if (!session.url) {
    redirect("/membre/mes-annonces?erreur=Le+paiement+n%27a+pas+pu+d%C3%A9marrer.");
  }
  redirect(session.url);
}

// Service payant « promotion sur les réseaux sociaux » (voir
// src/lib/promotionReseaux.ts) : paiement par Stripe Checkout ; le webhook
// enregistre la demande, qu'un administrateur publie ensuite.
export async function promouvoirSurReseaux(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/connexion?redirect=/membre/mes-annonces");

  const formule = formData.get("formule");
  if (!estFormule(formule)) {
    redirect("/membre/mes-annonces?erreur=Choisissez+une+formule+de+promotion.");
  }
  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!annonce || annonce.proprietaireId !== user.id || annonce.statut !== "EN_LIGNE") {
    redirect("/membre/mes-annonces?erreur=Seule+une+annonce+en+ligne+peut+%C3%AAtre+promue.");
  }

  const { nom, prix } = FORMULES_PROMOTION[formule];
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(prix * 100),
          product_data: { name: nom, description: `Annonce « ${annonce.titre} »` },
        },
      },
    ],
    // Repris par le webhook (payment_intent.succeeded).
    payment_intent_data: {
      metadata: { type: "promotion_reseaux", listingId: annonce.id, userId: user.id, formule },
    },
    success_url: `${siteUrl}/membre/mes-annonces?promotion=1`,
    cancel_url: `${siteUrl}/membre/mes-annonces`,
  });

  if (!session.url) {
    redirect("/membre/mes-annonces?erreur=Le+paiement+n%27a+pas+pu+d%C3%A9marrer.");
  }
  redirect(session.url);
}

// Avantage de l'abonnement Pro : une mise « À la une » offerte tous les
// 30 jours (voir src/lib/abonnementPro.ts), sans passer par Stripe.
export async function mettreEnAvantOffert(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/connexion?redirect=/membre/mes-annonces");
  if (!estProActif(user)) {
    redirect("/membre/mes-annonces?erreur=Cette+mise+%C3%A0+la+une+est+r%C3%A9serv%C3%A9e+aux+membres+Pro.");
  }

  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!annonce || annonce.proprietaireId !== user.id || annonce.statut !== "EN_LIGNE") {
    redirect("/membre/mes-annonces?erreur=Seule+une+annonce+en+ligne+peut+%C3%AAtre+mise+en+avant.");
  }

  const maintenant = new Date();
  const limite = new Date(maintenant.getTime() - JOURS_ENTRE_MISES_EN_AVANT_OFFERTES * 24 * 60 * 60 * 1000);
  // Mise à jour conditionnelle : un double clic ne consomme pas deux fois l'offre.
  const { count } = await prisma.user.updateMany({
    where: {
      id: user.id,
      OR: [{ derniereMiseEnAvantOfferte: null }, { derniereMiseEnAvantOfferte: { lte: limite } }],
    },
    data: { derniereMiseEnAvantOfferte: maintenant },
  });
  if (count === 0) {
    redirect("/membre/mes-annonces?erreur=Votre+mise+%C3%A0+la+une+offerte+a+d%C3%A9j%C3%A0+%C3%A9t%C3%A9+utilis%C3%A9e+ce+mois-ci.");
  }

  await prisma.listing.update({
    where: { id: annonce.id },
    data: { misEnAvantJusquau: dateApresMiseEnAvant(annonce.misEnAvantJusquau, maintenant) },
  });
  revalidatePath("/membre/mes-annonces");
  revalidatePath("/", "layout");
  redirect("/membre/mes-annonces?enavant=offert");
}

// Modes de remise d'une annonce existante (main à main, commerçant relais,
// livraison par le propriétaire) : modifiables sans nouvelle modération.
export async function modifierModesRemise(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/connexion?redirect=/membre/mes-annonces");

  const listingId = String(formData.get("listingId") ?? "");
  const remise = lireModesRemise(formData);
  if (remise.erreurs.length > 0) {
    redirect(`/membre/mes-annonces?erreur=${encodeURIComponent(remise.erreurs.join(" "))}`);
  }

  const { count } = await prisma.listing.updateMany({
    where: { id: listingId, proprietaireId: user.id },
    data: {
      modesRemise: remise.modesRemise,
      prixLivraison: remise.prixLivraison,
      distanceLivraisonKm: remise.distanceLivraisonKm,
    },
  });
  if (count === 0) redirect("/membre/mes-annonces?erreur=Annonce+introuvable.");

  revalidatePath("/membre/mes-annonces");
  redirect("/membre/mes-annonces?remise=ok");
}
