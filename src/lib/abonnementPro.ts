// Abonnement Pro (décision du 6 octobre 2026) : réservé aux professionnels
// (SIRET), payé chaque mois par Stripe (abonnement), résiliable à tout moment.
// Avantages tant que l'abonnement est actif :
// - annonces en ligne sans limite de durée ;
// - commission propriétaire réduite (10 % au lieu de 15 %) ;
// - badge « Pro » avec le nom de l'entreprise sur les annonces ;
// - une mise « À la une » offerte tous les 30 jours.
// Ce fichier ne doit dépendre ni de Prisma ni de Stripe (testé seul).
import { TAUX_COMMISSION_PROPRIETAIRE } from "./constantesReservation";

export const PRIX_ABONNEMENT_PRO = 14.9; // euros par mois
export const TAUX_COMMISSION_PRO = 0.1;
export const JOURS_ENTRE_MISES_EN_AVANT_OFFERTES = 30;

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

/** Statuts Stripe pour lesquels l'abonnement donne ses avantages. */
const STATUTS_STRIPE_ACTIFS = ["active", "trialing", "past_due"];

type MembrePro = { statut?: string | null; proActifJusquau?: Date | null };

/** Vrai si le membre a un abonnement Pro en cours. */
export function estProActif(membre: MembrePro | null | undefined, maintenant: Date = new Date()): boolean {
  return (
    membre?.statut === "PRO" && membre.proActifJusquau != null && new Date(membre.proActifJusquau) > maintenant
  );
}

/** Commission prélevée sur la location, selon l'abonnement du propriétaire. */
export function tauxCommissionProprietaire(proprietaireProActif: boolean): number {
  return proprietaireProActif ? TAUX_COMMISSION_PRO : TAUX_COMMISSION_PROPRIETAIRE;
}

/** Vrai si la mise « À la une » offerte est de nouveau disponible. */
export function miseEnAvantOfferteDisponible(
  derniereMiseEnAvantOfferte: Date | null | undefined,
  maintenant: Date = new Date()
): boolean {
  if (derniereMiseEnAvantOfferte == null) return true;
  return maintenant.getTime() - new Date(derniereMiseEnAvantOfferte).getTime() >= JOURS_ENTRE_MISES_EN_AVANT_OFFERTES * MS_PAR_JOUR;
}

/** Date à partir de laquelle la prochaine mise « À la une » offerte est possible. */
export function prochaineMiseEnAvantOfferte(derniereMiseEnAvantOfferte: Date): Date {
  return new Date(new Date(derniereMiseEnAvantOfferte).getTime() + JOURS_ENTRE_MISES_EN_AVANT_OFFERTES * MS_PAR_JOUR);
}

/** Garde uniquement les chiffres du SIRET saisi (espaces, points…). */
export function normaliserSiret(saisie: string): string {
  return saisie.replace(/\D/g, "");
}

/** Vérifie un SIRET : 14 chiffres et clé de Luhn (exception La Poste). */
export function siretValide(siret: string): boolean {
  if (!/^\d{14}$/.test(siret)) return false;
  // Les établissements de La Poste (SIREN 356000000) suivent une autre règle.
  if (siret.startsWith("356000000")) {
    const somme = [...siret].reduce((s, c) => s + Number(c), 0);
    return somme % 5 === 0;
  }
  let somme = 0;
  for (let i = 0; i < 14; i++) {
    let chiffre = Number(siret[13 - i]);
    if (i % 2 === 1) {
      chiffre *= 2;
      if (chiffre > 9) chiffre -= 9;
    }
    somme += chiffre;
  }
  return somme % 10 === 0;
}

type AbonnementStripe = {
  status: string;
  ended_at?: number | null;
  items: { data: { current_period_end: number }[] };
};

/**
 * Date jusqu'à laquelle les avantages Pro s'appliquent, d'après l'abonnement
 * Stripe : fin de la période payée tant qu'il est actif, sinon null.
 */
export function finAvantagesPro(abonnement: AbonnementStripe): Date | null {
  if (!STATUTS_STRIPE_ACTIFS.includes(abonnement.status)) return null;
  const fins = abonnement.items.data.map((item) => item.current_period_end);
  if (fins.length === 0) return null;
  return new Date(Math.max(...fins) * 1000);
}
