"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { estProActif } from "@/lib/abonnementPro";
import {
  PRIX_VERIFICATION_IDENTITE,
  estIdentiteVerifiee,
  etatVerification,
  peutLancerVerification,
} from "@/lib/verificationIdentite";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PAGE = "/membre/verification-identite";

function erreur(message: string): never {
  redirect(`${PAGE}?erreur=${encodeURIComponent(message)}`);
}

// Étape 1 : paiement de 2,99 € par Stripe Checkout (sauf membres Pro). Le
// webhook (payment_intent.succeeded) enregistre le paiement.
export async function payerVerificationIdentite() {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=${PAGE}`);
  if (estIdentiteVerifiee(user)) erreur("Votre identité est déjà vérifiée.");
  if (peutLancerVerification(user, estProActif(user))) redirect(PAGE);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(PRIX_VERIFICATION_IDENTITE * 100),
          product_data: { name: "Badge « Identité vérifiée »" },
        },
      },
    ],
    payment_intent_data: { metadata: { type: "verification_identite", userId: user.id } },
    success_url: `${siteUrl}${PAGE}?paye=1`,
    cancel_url: `${siteUrl}${PAGE}`,
  });

  if (!session.url) erreur("Le paiement n'a pas pu démarrer.");
  redirect(session.url);
}

// Étape 2 : vérification de la pièce d'identité et d'un selfie sur la page
// sécurisée de Stripe Identity. Le résultat arrive par le webhook
// (identity.verification_session.*).
export async function lancerVerificationIdentite() {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=${PAGE}`);
  if (!peutLancerVerification(user, estProActif(user))) {
    erreur(estIdentiteVerifiee(user) ? "Votre identité est déjà vérifiée." : "Le paiement n'a pas encore été reçu.");
  }

  // Reprend la vérification déjà commencée si Stripe la garde ouverte.
  if (user.stripeVerificationSessionId) {
    const existante = await stripe.identity.verificationSessions
      .retrieve(user.stripeVerificationSessionId)
      .catch(() => null);
    if (existante?.status === "processing") erreur("Votre vérification est en cours d'analyse.");
    // Une session pas terminée (ou à refaire) garde son lien : on le réutilise.
    if (existante?.status === "requires_input" && existante.url) redirect(existante.url);
  }

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    options: { document: { require_matching_selfie: true } },
    metadata: { userId: user.id },
    provided_details: { email: user.email },
    return_url: `${siteUrl}${PAGE}?retour=1`,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeVerificationSessionId: session.id,
      statutVerificationIdentite: etatVerification(session.status, session.last_error != null),
    },
  });

  if (!session.url) erreur("La vérification n'a pas pu démarrer.");
  redirect(session.url);
}
