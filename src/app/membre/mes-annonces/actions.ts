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
