import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { notifierPaiementRecu, notifierPromotionDemandee } from "@/lib/email/notifications";
import { dateApresProlongation } from "@/lib/dureeAnnonce";
import { dateApresMiseEnAvant } from "@/lib/miseEnAvant";
import { estProActif, finAvantagesPro } from "@/lib/abonnementPro";
import { finPeriodeGratuite } from "@/lib/dureeAnnonce";
import { enregistrerEtatVerification } from "@/lib/stripe/verificationIdentite";
import { FORMULES_PROMOTION, estFormule } from "@/lib/promotionReseaux";

// Webhook Stripe (section 11.1). À configurer dans le dashboard Stripe sur
// `${SITE_URL}/api/webhooks/stripe` avec les événements :
// payment_intent.succeeded, payment_intent.payment_failed, account.updated,
// customer.subscription.created, customer.subscription.updated,
// customer.subscription.deleted (abonnement Pro),
// identity.verification_session.verified, identity.verification_session.requires_input,
// identity.verification_session.processing, identity.verification_session.canceled
// (badge « Identité vérifiée »).

async function prolongerAnnoncePayee(listingId: string | undefined, paymentIntentId: string) {
  if (!listingId) return;
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  // Stripe peut renvoyer le même événement : on ne prolonge qu'une fois.
  if (!annonce || annonce.derniereProlongationPaiement === paymentIntentId) return;
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      enLigneJusquau: dateApresProlongation(annonce.enLigneJusquau, new Date()),
      derniereProlongationPaiement: paymentIntentId,
    },
  });
  revalidatePath("/", "layout");
}

async function appliquerMiseEnAvant(listingId: string | undefined, paymentIntentId: string) {
  if (!listingId) return;
  const annonce = await prisma.listing.findUnique({ where: { id: listingId } });
  // Stripe peut renvoyer le même événement : on n'applique qu'une fois.
  if (!annonce || annonce.dernierPaiementMiseEnAvant === paymentIntentId) return;
  const misEnAvantJusquau = dateApresMiseEnAvant(annonce.misEnAvantJusquau, new Date());
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      misEnAvantJusquau,
      // Une annonce payée pour être à la une reste en ligne au moins jusque-là.
      ...(annonce.enLigneJusquau && annonce.enLigneJusquau < misEnAvantJusquau
        ? { enLigneJusquau: misEnAvantJusquau }
        : {}),
      dernierPaiementMiseEnAvant: paymentIntentId,
    },
  });
  revalidatePath("/", "layout");
}

// Promotion sur les réseaux sociaux : on enregistre la demande, qu'un
// administrateur traitera dans /admin/promotions.
async function enregistrerPromotionReseaux(paymentIntent: Stripe.PaymentIntent) {
  const { listingId, userId, formule } = paymentIntent.metadata ?? {};
  if (!listingId || !userId || !estFormule(formule)) return;
  // Stripe peut renvoyer le même événement : une seule demande par paiement.
  const dejaEnregistree = await prisma.promotionReseaux.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
  if (dejaEnregistree) return;
  const annonce = await prisma.listing.findUnique({ where: { id: listingId }, select: { titre: true } });
  if (!annonce) return;
  await prisma.promotionReseaux.create({
    data: {
      listingId,
      userId,
      formule,
      montant: paymentIntent.amount_received / 100,
      stripePaymentIntentId: paymentIntent.id,
    },
  });
  await notifierPromotionDemandee({ titreAnnonce: annonce.titre, formule: FORMULES_PROMOTION[formule].nom });
}

// Abonnement Pro : Stripe prévient à chaque création, renouvellement,
// résiliation ou fin d'abonnement ; on recopie l'état chez le membre.
async function mettreAJourAbonnementPro(abonnement: Stripe.Subscription) {
  const customerId = typeof abonnement.customer === "string" ? abonnement.customer : abonnement.customer.id;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(abonnement.metadata?.userId ? [{ id: abonnement.metadata.userId }] : []),
        { stripeCustomerId: customerId },
      ],
    },
  });
  if (!user) return;
  // Un ancien abonnement qui se termine ne doit pas écraser le nouveau.
  if (user.stripeSubscriptionId && user.stripeSubscriptionId !== abonnement.id && abonnement.status !== "active") return;

  const maintenant = new Date();
  const etaitActif = estProActif(user, maintenant);
  const proActifJusquau = finAvantagesPro(abonnement);
  const estActif = proActifJusquau != null && proActifJusquau > maintenant;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: abonnement.id,
      proActifJusquau: estActif ? proActifJusquau : maintenant,
      proResiliationPrevue: estActif && (abonnement.cancel_at_period_end || abonnement.cancel_at != null),
      ...(estActif ? { statut: "PRO" as const } : {}),
    },
  });

  if (estActif && !etaitActif) {
    // Devient Pro : ses annonces validées restent en ligne sans limite.
    await prisma.listing.updateMany({
      where: { proprietaireId: user.id, statut: "EN_LIGNE" },
      data: { enLigneJusquau: null },
    });
  } else if (!estActif && etaitActif) {
    // Fin de l'abonnement : ses annonces repartent pour 15 jours gratuits.
    await prisma.listing.updateMany({
      where: { proprietaireId: user.id, statut: "EN_LIGNE", enLigneJusquau: null },
      data: { enLigneJusquau: finPeriodeGratuite(maintenant, false) },
    });
  }
  revalidatePath("/", "layout");
}

// Badge « Identité vérifiée » : paiement de 2,99 € reçu (une seule fois).
async function enregistrerPaiementVerification(userId: string | undefined, paymentIntentId: string) {
  if (!userId) return;
  await prisma.user.updateMany({
    where: { id: userId, NOT: { dernierPaiementVerification: paymentIntentId } },
    data: { verificationIdentitePayee: true, dernierPaiementVerification: paymentIntentId },
  });
}

// Résultat de la vérification Stripe Identity : seul l'état est recopié,
// aucune donnée de la pièce d'identité.
async function mettreAJourVerificationIdentite(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata?.userId;
  if (!userId) return;
  await enregistrerEtatVerification(userId, session);
}

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

        // Prolongation payante d'une annonce (2 € pour 30 jours).
        if (paymentIntent.metadata?.type === "prolongation_annonce") {
          await prolongerAnnoncePayee(paymentIntent.metadata.listingId, paymentIntent.id);
          break;
        }

        // Badge « Identité vérifiée » (2,99 €).
        if (paymentIntent.metadata?.type === "verification_identite") {
          await enregistrerPaiementVerification(paymentIntent.metadata.userId, paymentIntent.id);
          break;
        }

        // Promotion sur les réseaux sociaux (service payant).
        if (paymentIntent.metadata?.type === "promotion_reseaux") {
          await enregistrerPromotionReseaux(paymentIntent);
          break;
        }

        // Annonce mise en avant (service payant).
        if (paymentIntent.metadata?.type === "mise_en_avant") {
          await appliquerMiseEnAvant(paymentIntent.metadata.listingId, paymentIntent.id);
          break;
        }

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

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await mettreAJourAbonnementPro(event.data.object as Stripe.Subscription);
        break;
      }

      case "identity.verification_session.verified":
      case "identity.verification_session.requires_input":
      case "identity.verification_session.processing":
      case "identity.verification_session.canceled": {
        await mettreAJourVerificationIdentite(event.data.object as Stripe.Identity.VerificationSession);
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
