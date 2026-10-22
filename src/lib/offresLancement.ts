// Offres de lancement (décision du 22 octobre 2026), sans aucun coût :
// - commission propriétaire à 0 % pendant les 3 premiers mois du site ;
// - « Membre fondateur » : les 100 premiers membres dont une annonce est
//   validée reçoivent un badge et 7 jours « À la une » offerts ;
// - premier mois de l'abonnement Pro offert (essai gratuit Stripe) pendant
//   les 3 premiers mois.
// La date d'ouverture se règle dans Vercel (variable DATE_OUVERTURE_SITE,
// au format AAAA-MM-JJ), le jour où le site est ouvert au public. Tant
// qu'elle est vide, le site n'est pas encore ouvert : les offres s'appliquent
// déjà aux annonces publiées avant l'ouverture.
// Ce fichier ne doit dépendre ni de Prisma ni de Stripe (testé seul).

export const MOIS_OFFRE_LANCEMENT = 3;
export const NOMBRE_MEMBRES_FONDATEURS = 100;
export const JOURS_ESSAI_PRO = 30;

/** Lit la date d'ouverture (AAAA-MM-JJ) ; null si vide ou invalide. */
export function lireDateOuverture(valeur: string | undefined = process.env.DATE_OUVERTURE_SITE): Date | null {
  if (!valeur || !/^\d{4}-\d{2}-\d{2}$/.test(valeur.trim())) return null;
  const date = new Date(`${valeur.trim()}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date de fin des offres : 3 mois après l'ouverture. */
export function finOffreLancement(dateOuverture: Date): Date {
  const fin = new Date(dateOuverture);
  fin.setUTCMonth(fin.getUTCMonth() + MOIS_OFFRE_LANCEMENT);
  return fin;
}

/** Vrai pendant les offres de lancement (et avant l'ouverture du site). */
export function offreLancementActive(
  dateOuverture: Date | null = lireDateOuverture(),
  maintenant: Date = new Date()
): boolean {
  if (dateOuverture == null) return true;
  return maintenant < finOffreLancement(dateOuverture);
}

/** Date de fin à afficher, ou null si le site n'est pas encore ouvert. */
export function dateFinOffreLancement(dateOuverture: Date | null = lireDateOuverture()): Date | null {
  return dateOuverture ? finOffreLancement(dateOuverture) : null;
}

/** Vrai s'il reste des places de « Membre fondateur ». */
export function placeFondateurDisponible(nombreFondateurs: number): boolean {
  return nombreFondateurs < NOMBRE_MEMBRES_FONDATEURS;
}
