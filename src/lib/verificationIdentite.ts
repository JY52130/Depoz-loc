// Badge « Identité vérifiée » (décision du 6 octobre 2026) : le membre fait
// vérifier sa pièce d'identité et un selfie par Stripe Identity. Option
// payante à 2,99 €, une seule fois, offerte aux membres Pro. Dépôt Malin ne
// garde que la date de vérification : la pièce d'identité reste chez Stripe.
// Ce fichier ne doit dépendre ni de Prisma ni de Stripe (testé seul).

export const PRIX_VERIFICATION_IDENTITE = 2.99; // euros, une seule fois

type Membre = { identiteVerifieeLe?: Date | null; verificationIdentitePayee?: boolean | null };

export function estIdentiteVerifiee(membre: Membre | null | undefined): boolean {
  return membre?.identiteVerifieeLe != null;
}

/** Vrai si le membre peut lancer la vérification sans (re)payer. */
export function peutLancerVerification(membre: Membre, proActif: boolean): boolean {
  if (estIdentiteVerifiee(membre)) return false;
  return proActif || membre.verificationIdentitePayee === true;
}

/**
 * État enregistré chez nous, d'après la session Stripe Identity. Une session
 * neuve est déjà « requires_input » chez Stripe : sans erreur, cela veut dire
 * que le membre n'a pas encore terminé, pas que la vérification a échoué.
 */
export function etatVerification(statutStripe: string, aUneErreur: boolean): string {
  if (statutStripe === "requires_input") return aUneErreur ? "echec" : "a_terminer";
  return statutStripe; // processing, verified, canceled
}

/** Message affiché au membre selon l'état de la vérification. */
export const LIBELLES_STATUT_VERIFICATION: Record<string, string> = {
  a_terminer: "Vous n'avez pas encore terminé la vérification : cliquez sur le bouton pour la continuer.",
  processing: "Vérification en cours d'analyse : cela prend en général quelques minutes.",
  echec:
    "La vérification n'a pas abouti (photo floue, document illisible ou expiré…). Vous pouvez recommencer sans payer à nouveau.",
  canceled: "La vérification a été annulée. Vous pouvez la recommencer sans payer à nouveau.",
};
