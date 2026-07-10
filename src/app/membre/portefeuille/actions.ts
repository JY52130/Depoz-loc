"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Onboarding Stripe Connect (comptes Express) — section 6.2 étape 8 / 11.1.
// Déclenché depuis le Portefeuille (section 7.2). Peut être appelé plusieurs
// fois : si le compte existe déjà mais l'onboarding est incomplet, on
// régénère simplement un nouveau lien.
export async function demarrerOnboardingStripe() {
  const user = await getOrCreateUser();
  if (!user) {
    redirect("/connexion?redirect=/membre/portefeuille");
  }

  let stripeAccountId = user.stripeAccountId;

  if (!stripeAccountId) {
    const compte = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      business_type: user.statut === "PRO" ? "company" : "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    stripeAccountId = compte.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId },
    });
  }

  const lien = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${siteUrl}/membre/portefeuille?onboarding=refresh`,
    return_url: `${siteUrl}/membre/portefeuille?onboarding=retour`,
    type: "account_onboarding",
  });

  redirect(lien.url);
}
