// Durée de mise en ligne d'une annonce (décision du 5 octobre 2026) :
// - 15 jours gratuits après validation par la modération ;
// - ensuite, prolongation de 30 jours pour 2 € (paiement Stripe) ;
// - prolongation gratuite si l'objet a déjà été loué (une commission a été
//   perçue) ;
// - pas de limite pour les membres Pro (enLigneJusquau = null).
// Une annonce expirée garde le statut EN_LIGNE mais n'est plus visible :
// aucune tâche planifiée n'est nécessaire pour la masquer.
import type { BookingStatus, Prisma } from "@prisma/client";

export const JOURS_GRATUITS = 15;
export const JOURS_PROLONGATION = 30;
export const PRIX_PROLONGATION = 2; // euros
export const JOURS_RAPPEL_AVANT_EXPIRATION = 3;

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

/** Réservations qui prouvent que l'objet a été loué (paiement reçu). */
export const STATUTS_LOCATION_PAYEE: BookingStatus[] = ["EN_COURS", "RETOURNEE", "CLOTUREE", "LITIGE"];

/** Date de fin de la période gratuite, ou null (pas de limite) pour un Pro. */
export function finPeriodeGratuite(maintenant: Date, proprietaireEstPro: boolean): Date | null {
  if (proprietaireEstPro) return null;
  return new Date(maintenant.getTime() + JOURS_GRATUITS * MS_PAR_JOUR);
}

/** Nouvelle date de fin après une prolongation de 30 jours. */
export function dateApresProlongation(enLigneJusquau: Date | null, maintenant: Date): Date {
  const depart = enLigneJusquau && enLigneJusquau > maintenant ? enLigneJusquau : maintenant;
  return new Date(depart.getTime() + JOURS_PROLONGATION * MS_PAR_JOUR);
}

export function estExpiree(enLigneJusquau: Date | null, maintenant: Date = new Date()): boolean {
  return enLigneJusquau != null && enLigneJusquau <= maintenant;
}

/** Vrai si l'annonce expire dans les 3 prochains jours. */
export function expireBientot(enLigneJusquau: Date | null, maintenant: Date = new Date()): boolean {
  if (enLigneJusquau == null || estExpiree(enLigneJusquau, maintenant)) return false;
  return enLigneJusquau.getTime() - maintenant.getTime() <= JOURS_RAPPEL_AVANT_EXPIRATION * MS_PAR_JOUR;
}

/** Filtre Prisma des annonces visibles par le public. */
export function annonceVisible(maintenant: Date = new Date()): Prisma.ListingWhereInput {
  return {
    statut: "EN_LIGNE",
    AND: [{ OR: [{ enLigneJusquau: null }, { enLigneJusquau: { gt: maintenant } }] }],
  };
}
