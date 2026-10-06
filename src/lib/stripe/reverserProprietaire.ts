// Reversement au propriétaire après clôture d'une location (section 4.4 / 6.4).
// À appeler une fois l'état des lieux de retour validé (Phase 4 — messagerie,
// états des lieux, avis). Tant que ce workflow n'existe pas, cette fonction
// n'est appelée nulle part mais est prête à l'emploi.
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { netProprietaireReservation } from "@/lib/livraison";

export async function reverserProprietaire(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { proprietaire: true, transaction: true },
  });

  if (!booking) throw new Error("Réservation introuvable.");
  if (booking.statut !== "RETOURNEE") {
    throw new Error(
      "Le reversement ne peut avoir lieu qu'après validation de l'état des lieux de retour (statut RETOURNEE)."
    );
  }
  if (!booking.transaction) throw new Error("Aucune transaction associée à cette réservation.");
  if (!booking.proprietaire.stripeAccountId || !booking.proprietaire.stripeOnboardingDone) {
    throw new Error("Le propriétaire n'a pas terminé son inscription Stripe Connect.");
  }

  // Location + éventuelle livraison faite par le propriétaire, moins les commissions.
  const montantNet = netProprietaireReservation(booking);

  const transfer = await stripe.transfers.create({
    amount: Math.round(montantNet * 100),
    currency: "eur",
    destination: booking.proprietaire.stripeAccountId,
    transfer_group: booking.id,
    metadata: { bookingId: booking.id },
  });

  await prisma.transaction.update({
    where: { bookingId: booking.id },
    data: { stripeTransferId: transfer.id, statut: "reverse" },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { statut: "CLOTUREE" },
  });

  return transfer;
}
