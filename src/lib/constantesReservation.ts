// Constantes partagées client/serveur pour les réservations — ne doit avoir
// AUCUNE dépendance serveur (Prisma, etc.) car importé depuis des composants
// client (ex: ReserverForm) et depuis les server actions.

// Frais commerçant relais : forfait à la charge du locataire, encaissé par
// Dépôt Malin, qui rémunère le commerçant selon son accord avec lui.
export const FRAIS_POINT_RELAIS = 5;

// Commissions Dépôt Malin (décision du 2 octobre 2026 : 10 % + 15 %).
// Frais de service ajoutés au paiement du locataire.
export const TAUX_FRAIS_LOCATAIRE = 0.1;
// Commission prélevée sur le reversement au propriétaire.
export const TAUX_COMMISSION_PROPRIETAIRE = 0.15;

// Frais de service minimum pour le locataire (les très petites locations
// rapportent au moins ce montant).
export const FRAIS_LOCATAIRE_MINIMUM = 1;

export function calculerFraisLocataire(montantLocation: number): number {
  if (montantLocation <= 0) return 0;
  return Math.max(FRAIS_LOCATAIRE_MINIMUM, arrondiCentimes(montantLocation * TAUX_FRAIS_LOCATAIRE));
}

export function arrondiCentimes(montant: number): number {
  return Math.round(montant * 100) / 100;
}
