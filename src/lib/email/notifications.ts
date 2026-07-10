// Modèles de notification pour les événements clés (section 8 / 11.5) :
// réservation confirmée (paiement reçu), retour/clôture, litige ouvert.
import { envoyerEmail } from "@/lib/email/envoyerEmail";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "litiges@depozloc.fr";

export async function notifierPaiementRecu(params: {
  emailLocataire: string;
  emailProprietaire: string;
  titreAnnonce: string;
}) {
  await Promise.all([
    envoyerEmail({
      to: params.emailLocataire,
      subject: "Votre réservation DepozLoc est confirmée",
      html: `<p>Votre paiement pour « ${params.titreAnnonce} » a bien été reçu. Votre réservation est confirmée.</p>`,
    }),
    envoyerEmail({
      to: params.emailProprietaire,
      subject: "Nouvelle réservation payée sur DepozLoc",
      html: `<p>Vous avez une nouvelle réservation payée pour « ${params.titreAnnonce} ». Consultez votre espace membre pour organiser la remise.</p>`,
    }),
  ]);
}

export async function notifierClotureLocation(params: {
  emailLocataire: string;
  emailProprietaire: string;
  titreAnnonce: string;
}) {
  await Promise.all([
    envoyerEmail({
      to: params.emailLocataire,
      subject: "Votre caution a été libérée",
      html: `<p>La location de « ${params.titreAnnonce} » est clôturée. Aucun dommage n'a été signalé : votre caution est libérée.</p>`,
    }),
    envoyerEmail({
      to: params.emailProprietaire,
      subject: "Paiement reversé",
      html: `<p>La location de « ${params.titreAnnonce} » est clôturée. Le paiement (net de commission) a été reversé sur votre compte Stripe.</p>`,
    }),
  ]);
}

export async function notifierLitigeOuvert(params: {
  emailAutrePartie: string;
  titreAnnonce: string;
  motif: string;
  bookingId: string;
}) {
  await Promise.all([
    envoyerEmail({
      to: params.emailAutrePartie,
      subject: "Un litige a été ouvert sur une de vos locations",
      html: `<p>Un litige a été ouvert concernant « ${params.titreAnnonce} ». Motif : ${params.motif}</p><p>Notre équipe va vous contacter par email.</p>`,
    }),
    envoyerEmail({
      to: ADMIN_EMAIL,
      subject: `[Litige] Réservation ${params.bookingId}`,
      html: `<p>Nouveau litige — annonce « ${params.titreAnnonce} », réservation ${params.bookingId}.</p><p>Motif : ${params.motif}</p>`,
    }),
  ]);
}
