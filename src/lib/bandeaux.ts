// Bandeaux publicitaires (décision du 22 octobre 2026) : l'espace est vendu
// en direct aux commerçants locaux, sans régie (pas de Google AdSense), donc
// sans cookie ni suivi. L'admin ajoute le bandeau dans /admin/bandeaux après
// paiement (lien de paiement Stripe envoyé au commerçant) ; il s'affiche tout
// seul entre ses dates de début et de fin.
// Ce fichier ne doit dépendre ni de Prisma ni de Stripe (testé seul).
import type { EmplacementBandeau } from "@prisma/client";

export const EMPLACEMENTS_BANDEAU: Record<
  EmplacementBandeau,
  { nom: string; description: string; prixSemaine: number; prixMois: number }
> = {
  ACCUEIL: {
    nom: "Page d'accueil",
    description: "sous les annonces « À la une », vu par tous les visiteurs",
    prixSemaine: 15,
    prixMois: 49,
  },
  LISTE: {
    nom: "Listes d'annonces",
    description: "au-dessus des annonces de chaque catégorie",
    prixSemaine: 10,
    prixMois: 29,
  },
};

// Taille conseillée de l'image (format bandeau, lisible sur téléphone).
export const LARGEUR_IMAGE_BANDEAU = 1200;
export const HAUTEUR_IMAGE_BANDEAU = 300;

export const LONGUEUR_MAX_TEXTE_ALTERNATIF = 250;

/** Lien vers le site du commerçant : seulement http(s), sinon null. */
export function lienBandeauValide(saisie: string): string | null {
  try {
    const url = new URL(saisie.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type BandeauDates = { actif: boolean; debut: Date; fin: Date };

/** Vrai si le bandeau doit être affiché maintenant. */
export function bandeauEnCours(bandeau: BandeauDates, maintenant: Date = new Date()): boolean {
  return bandeau.actif && new Date(bandeau.debut) <= maintenant && maintenant < new Date(bandeau.fin);
}

/** Lit une date du formulaire (AAAA-MM-JJ), à minuit heure de Paris. */
export function dateFormulaire(valeur: string, finDeJournee = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return null;
  // Heure d'hiver (+01:00) : un écart d'une heure en été est sans importance ici.
  const date = new Date(`${valeur}T${finDeJournee ? "23:59:59" : "00:00:00"}+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
