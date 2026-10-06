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

/** Message affiché au membre selon l'état de la vérification Stripe. */
export const LIBELLES_STATUT_VERIFICATION: Record<string, string> = {
  processing: "Vérification en cours d'analyse : cela prend en général quelques minutes.",
  requires_input:
    "La vérification n'a pas abouti (photo floue, document illisible ou expiré…). Vous pouvez recommencer sans payer à nouveau.",
  canceled: "La vérification a été annulée. Vous pouvez la recommencer sans payer à nouveau.",
};
