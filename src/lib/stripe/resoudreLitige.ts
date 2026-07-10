// Résolution d'un litige (section 6.6 / 9.5) — back-office uniquement.
// Débite tout ou partie de la caution (charge off-session sur la carte
// enregistrée via le SetupIntent), reverse le propriétaire (loyer net +
// caution retenue le cas échéant), clôture la réservation.
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { reverserProprietaire } from "@/lib/stripe/reverserProprietaire";

export async function resoudreLitige(
  bookingId: string,
  montantCautionRetenu: number,
  decision: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { transaction: true, proprietaire: true, dispute: true },
  });

  if (!booking) throw new Error("Réservation introuvable.");
  if (!booking.dispute) throw new Error("Aucun litige ouvert sur cette réservation.");
  if (!booking.transaction?.stripeSetupIntentId) {
    throw new Error("Aucune empreinte de carte (SetupIntent) associée à cette réservation.");
  }

  let montantEffectivementRetenu = 0;

  if (montantCautionRetenu > 0) {
    const setupIntent = await stripe.setupIntents.retrieve(booking.transaction.stripeSetupIntentId);
    const paymentMethod = setupIntent.payment_method;

    if (typeof paymentMethod !== "string") {
      throw new Error("Le moyen de paiement de la caution n'est pas disponible (paiement non confirmé ?).");
    }

    await stripe.paymentIntents.create({
      amount: Math.round(montantCautionRetenu * 100),
      currency: "eur",
      payment_method: paymentMethod,
      customer: typeof setupIntent.customer === "string" ? setupIntent.customer : undefined,
      off_session: true,
      confirm: true,
      description: `Retenue de caution — réservation ${booking.id}`,
      metadata: { bookingId: booking.id, type: "retenue_caution" },
    });

    montantEffectivementRetenu = montantCautionRetenu;
  }

  // Clôture + reversement du loyer net (fonctionne uniquement si le statut
  // est RETOURNEE — un état des lieux de sortie doit avoir été déposé).
  if (booking.statut === "RETOURNEE") {
    await reverserProprietaire(booking.id);
  } else if (booking.statut !== "CLOTUREE") {
    throw new Error(
      "La réservation doit être au statut RETOURNEE (état des lieux de sortie déposé) avant de résoudre le litige."
    );
  }

  if (montantEffectivementRetenu > 0 && booking.proprietaire.stripeAccountId) {
    await stripe.transfers.create({
      amount: Math.round(montantEffectivementRetenu * 100),
      currency: "eur",
      destination: booking.proprietaire.stripeAccountId,
      transfer_group: booking.id,
      metadata: { bookingId: booking.id, type: "retenue_caution" },
    });
  }

  await prisma.dispute.update({
    where: { bookingId: booking.id },
    data: {
      statut: "RESOLU",
      decision,
      montantCautionRetenu: montantEffectivementRetenu || undefined,
    },
  });
}
