// Modèles de notification pour les événements clés (section 8 / 11.5) :
// réservation confirmée (paiement reçu), retour/clôture, litige ouvert.
import { envoyerEmail } from "@/lib/email/envoyerEmail";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "litiges@depotmalin.fr";

export async function notifierPaiementRecu(params: {
  emailLocataire: string;
  emailProprietaire: string;
  titreAnnonce: string;
}) {
  await Promise.all([
    envoyerEmail({
      to: params.emailLocataire,
      subject: "Votre réservation Dépôt Malin est confirmée",
      html: `<p>Votre paiement pour « ${params.titreAnnonce} » a bien été reçu. Votre réservation est confirmée.</p>`,
    }),
    envoyerEmail({
      to: params.emailProprietaire,
      subject: "Nouvelle réservation payée sur Dépôt Malin",
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

export async function notifierAnnonceBientotExpiree(params: {
  emailProprietaire: string;
  titreAnnonce: string;
  enLigneJusquau: Date;
  prolongationGratuite: boolean;
  lien: string;
}) {
  const date = params.enLigneJusquau.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
  const prix = params.prolongationGratuite
    ? "gratuitement, car votre objet a déjà été loué"
    : "pour 2 €";
  await envoyerEmail({
    to: params.emailProprietaire,
    subject: "Votre annonce Dépôt Malin expire bientôt",
    html: `<p>Votre annonce « ${params.titreAnnonce} » ne sera plus visible après le ${date}.</p><p>Vous pouvez la prolonger de 30 jours ${prix} depuis <a href="${params.lien}">Mes annonces</a>.</p>`,
  });
}

export async function notifierPromotionDemandee(params: { titreAnnonce: string; formule: string }) {
  await envoyerEmail({
    to: ADMIN_EMAIL,
    subject: "Nouvelle promotion à publier sur les réseaux",
    html: `<p>Une promotion a été payée : « ${params.formule} » pour l'annonce « ${params.titreAnnonce} ».</p><p>À publier depuis le back-office, rubrique Promotions.</p>`,
  });
}

export async function notifierPromotionPubliee(params: {
  emailProprietaire: string;
  titreAnnonce: string;
  lienPublication: string;
}) {
  await envoyerEmail({
    to: params.emailProprietaire,
    subject: "Votre annonce est publiée sur nos réseaux",
    html: `<p>Votre annonce « ${params.titreAnnonce} » est maintenant publiée sur les réseaux sociaux de Dépôt Malin.</p><p><a href="${params.lienPublication}">Voir la publication</a></p>`,
  });
}
