// Réservation & blocage de calendrier (section 9.3) :
// "Deux réservations ne peuvent pas se chevaucher sur un même objet."
import { prisma } from "@/lib/prisma";
export { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";

const STATUTS_BLOQUANTS = ["RESERVEE", "EN_COURS", "RETOURNEE", "CLOTUREE", "LITIGE"] as const;

export async function estDisponible(
  listingId: string,
  dateDebut: Date,
  dateFin: Date
): Promise<boolean> {
  const conflit = await prisma.booking.findFirst({
    where: {
      listingId,
      statut: { in: [...STATUTS_BLOQUANTS] },
      dateDebut: { lte: dateFin },
      dateFin: { gte: dateDebut },
    },
  });

  return !conflit;
}
