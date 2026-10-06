"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PRIX_ABONNEMENT_PRO, estProActif, normaliserSiret, siretValide } from "@/lib/abonnementPro";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PAGE = "/membre/abonnement-pro";

function erreur(message: string): never {
  redirect(`${PAGE}?erreur=${encodeURIComponent(message)}`);
}

// Souscription à l'abonnement Pro (voir src/lib/abonnementPro.ts) : on
// enregistre l'entreprise, puis paiement mensuel par Stripe Checkout. Les
// avantages sont activés par le webhook Stripe (customer.subscription.*).
export async function souscrireAbonnementPro(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=${PAGE}`);
  if (estProActif(user)) erreur("Votre abonnement Pro est déjà actif.");

  const nomEntreprise = String(formData.get("nomEntreprise") ?? "").trim();
  const siret = normaliserSiret(String(formData.get("siret") ?? ""));
  const numeroTva = String(formData.get("numeroTva") ?? "").replace(/\s/g, "").toUpperCase();

  if (!nomEntreprise) erreur("Indiquez le nom de votre entreprise.");
  if (!siretValide(siret)) erreur("Le numéro SIRET doit comporter 14 chiffres valides.");

  // Réutilise le client Stripe du membre pour retrouver ses abonnements
  // (sauf s'il n'existe plus, par exemple après le passage du mode test au réel).
  let customerId = user.stripeCustomerId;
  if (customerId) {
    const existant = await stripe.customers.retrieve(customerId).catch(() => null);
    if (!existant || existant.deleted) customerId = null;
  }
  if (!customerId) {
    const client = await stripe.customers.create({
      email: user.email,
      name: nomEntreprise,
      metadata: { userId: user.id },
    });
    customerId = client.id;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { nomEntreprise, siret, numeroTva: numeroTva || null, stripeCustomerId: customerId },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(PRIX_ABONNEMENT_PRO * 100),
          recurring: { interval: "month" },
          product_data: { name: "Abonnement Pro Dépôt Malin" },
        },
      },
    ],
    // Repris par le webhook pour retrouver le membre.
    subscription_data: { metadata: { type: "abonnement_pro", userId: user.id } },
    success_url: `${siteUrl}${PAGE}?pro=bienvenue`,
    cancel_url: `${siteUrl}${PAGE}`,
  });

  if (!session.url) erreur("Le paiement n'a pas pu démarrer.");
  redirect(session.url);
}

// Résiliation : l'abonnement s'arrête à la fin du mois déjà payé.
export async function resilierAbonnementPro() {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=${PAGE}`);
  if (!user.stripeSubscriptionId) erreur("Aucun abonnement Pro à résilier.");

  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
  await prisma.user.update({ where: { id: user.id }, data: { proResiliationPrevue: true } });
  revalidatePath(PAGE);
  redirect(`${PAGE}?pro=resilie`);
}

// Annule une résiliation demandée, tant que le mois payé n'est pas fini.
export async function reprendreAbonnementPro() {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=${PAGE}`);
  if (!user.stripeSubscriptionId || !estProActif(user)) erreur("Aucun abonnement Pro à reprendre.");

  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false });
  await prisma.user.update({ where: { id: user.id }, data: { proResiliationPrevue: false } });
  revalidatePath(PAGE);
  redirect(`${PAGE}?pro=repris`);
}
