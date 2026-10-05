// Service payant « annonce mise en avant » (décision du 5 octobre 2026) :
// pendant 7 jours, l'annonce passe en tête de la recherche et de sa
// catégorie, avec un badge « À la une », et apparaît sur la page d'accueil.
// Le prix dépend du prix de location à la journée de l'objet (paliers).
// Paiement par Stripe Checkout, appliqué par le webhook Stripe.

export const JOURS_MISE_EN_AVANT = 7;

// Paliers : prix de location à la journée jusqu'à « jusqua » € → prix en €.
export const PALIERS_MISE_EN_AVANT = [
  { jusqua: 10, prix: 2 },
  { jusqua: 30, prix: 4 },
  { jusqua: Infinity, prix: 6 },
] as const;

type Tarifs = {
  prixDemiJournee?: unknown;
  prixJournee?: unknown;
  prixSemaine?: unknown;
  prixMois?: unknown;
};

function nombre(valeur: unknown): number | null {
  if (valeur == null) return null;
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

/** Prix d'une journée de location, déduit du tarif disponible le plus proche. */
export function prixJourneeReference(t: Tarifs): number {
  const journee = nombre(t.prixJournee);
  if (journee != null) return journee;
  const demi = nombre(t.prixDemiJournee);
  if (demi != null) return demi * 2;
  const semaine = nombre(t.prixSemaine);
  if (semaine != null) return semaine / 7;
  const mois = nombre(t.prixMois);
  if (mois != null) return mois / 30;
  return 0;
}

/** Prix de la mise en avant (7 jours) selon le prix de location de l'objet. */
export function prixMiseEnAvant(t: Tarifs): number {
  const parJour = prixJourneeReference(t);
  return PALIERS_MISE_EN_AVANT.find((p) => parJour <= p.jusqua)!.prix;
}

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

export function estMiseEnAvant(misEnAvantJusquau: Date | null | undefined, maintenant: Date = new Date()): boolean {
  return misEnAvantJusquau != null && new Date(misEnAvantJusquau) > maintenant;
}

/** Nouvelle date de fin : 7 jours de plus, à partir de la fin en cours s'il y en a une. */
export function dateApresMiseEnAvant(misEnAvantJusquau: Date | null, maintenant: Date): Date {
  const depart = misEnAvantJusquau && misEnAvantJusquau > maintenant ? misEnAvantJusquau : maintenant;
  return new Date(depart.getTime() + JOURS_MISE_EN_AVANT * MS_PAR_JOUR);
}

/** Place les annonces mises en avant en premier, sans changer l'ordre des autres. */
export function trierMisesEnAvant<T extends { misEnAvantJusquau?: Date | null }>(
  annonces: T[],
  maintenant: Date = new Date()
): T[] {
  const enAvant = annonces.filter((a) => estMiseEnAvant(a.misEnAvantJusquau, maintenant));
  const autres = annonces.filter((a) => !estMiseEnAvant(a.misEnAvantJusquau, maintenant));
  return [...enAvant, ...autres];
}
