// Client Stripe (serveur uniquement — ne jamais importer depuis un composant client).
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === "production") {
  console.warn("STRIPE_SECRET_KEY est absent : les fonctionnalités de paiement échoueront.");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});
