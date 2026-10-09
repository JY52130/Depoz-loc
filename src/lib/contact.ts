// Formulaire de la page Contact : sujets proposés et contrôle des champs.
// Les messages sont enregistrés en base (MessageContact) et l'équipe est
// prévenue par e-mail.

export const SUJETS_CONTACT = [
  "Question sur une location",
  "Problème avec mon compte",
  "Paiement ou remboursement",
  "Devenir commerçant relais",
  "Signaler une annonce",
  "Autre",
] as const;

export const LONGUEUR_MAX_MESSAGE = 3000;

export type MessageValide = { nom: string; email: string; sujet: string; message: string };

/** Contrôle les champs ; renvoie les erreurs à afficher, ou le message nettoyé. */
export function verifierMessageContact(champs: {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}): { erreurs: string[]; valeur: MessageValide | null } {
  const nom = champs.nom.trim();
  const email = champs.email.trim().toLowerCase();
  const sujet = champs.sujet.trim();
  const message = champs.message.trim();
  const erreurs: string[] = [];
  if (nom.length < 2 || nom.length > 100) erreurs.push("Indiquez votre nom.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    erreurs.push("Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.");
  }
  if (!(SUJETS_CONTACT as readonly string[]).includes(sujet)) erreurs.push("Choisissez un sujet.");
  if (message.length < 10) erreurs.push("Écrivez votre message (10 caractères au moins).");
  if (message.length > LONGUEUR_MAX_MESSAGE) {
    erreurs.push(`Votre message est trop long (${LONGUEUR_MAX_MESSAGE} caractères au plus).`);
  }
  return { erreurs, valeur: erreurs.length ? null : { nom, email, sujet, message } };
}
