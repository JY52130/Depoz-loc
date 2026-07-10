import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { notifierPaiementRecu } from "@/lib/email/notifications";

// Webhook Stripe (section 11.1). À configurer dans le dashboard Stripe sur
// `${SITE_URL}/api/webhooks/stripe` avec les événements :
// payment_intent.succeeded, payment_intent.payment_failed, account.updated.

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const corpsBrut = await request.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ erreur: "Signature ou secret webhook manquant." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(corpsBrut, signature, webhookSecret);
  } catch (err) {
    console.error("Échec de vérification de la signature Stripe :", err);
    return NextResponse.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        if (!bookingId) break;

        const transaction = await prisma.transaction.findUnique({ where: { bookingId } });
        if (!transaction) break;

        await prisma.transaction.update({
          where: { bookingId },
          data: { statut: "paye" },
        });
        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: { statut: "EN_COURS" },
          include: {
            listing: true,
            locataire: { select: { email: true } },
            proprietaire: { select: { email: true } },
          },
        });

        await notifierPaiementRecu({
          emailLocataire: booking.locataire.email,
          emailProprietaire: booking.proprietaire.email,
          titreAnnonce: booking.listing.titre,
        });

        // Attache le moyen de paiement utilisé au SetupIntent de la caution,
        // pour permettre un débit off-session ultérieur en cas de dommage.
        const paymentMethod = paymentIntent.payment_method;
        if (transaction.stripeSetupIntentId && typeof paymentMethod === "string") {
          try {
            await stripe.setupIntents.confirm(transaction.stripeSetupIntentId, {
              payment_method: paymentMethod,
            });
          } catch (err) {
            console.error("Échec de confirmation du SetupIntent (caution) :", err);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        if (!bookingId) break;

        await prisma.transaction.updateMany({
          where: { bookingId },
          data: { statut: "echoue" },
        });
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const onboardingComplet = Boolean(account.charges_enabled && account.payouts_enabled);

        await prisma.user.updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboardingDone: onboardingComplet },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Erreur de traitement du webhook Stripe (${event.type}) :`, err);
    return NextResponse.json({ erreur: "Erreur de traitement." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
