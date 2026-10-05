"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { estDisponible } from "@/lib/reservations";
import {
  FRAIS_POINT_RELAIS,
  TAUX_COMMISSION_PROPRIETAIRE,
  arrondiCentimes,
  calculerFraisLocataire,
} from "@/lib/constantesReservation";
import { calculerPrixLocation } from "@/lib/tarifs";
import { construirePeriode } from "@/lib/periodeLocation";
import type { DeliveryMode } from "@prisma/client";

export async function creerReservation(formData: FormData) {
  const user = await getOrCreateUser();
  const listingId = String(formData.get("listingId") ?? "");
  const modeRemise = String(formData.get("modeRemise") ?? "") as DeliveryMode;

  if (!user) {
    redirect(`/connexion?redirect=/annonce/${formData.get("slug") ?? ""}`);
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing || listing.statut !== "EN_LIGNE") {
    redirect(`/annonce/${formData.get("slug")}?erreur=Cette+annonce+n%27est+plus+disponible.`);
  }

  if (listing.proprietaireId === user.id) {
    redirect(`/annonce/${listing.slug}?erreur=Vous+ne+pouvez+pas+r%C3%A9server+votre+propre+annonce.`);
  }

  if (formData.get("accepteContrat") !== "on") {
    redirect(`/annonce/${listing.slug}?erreur=Vous+devez+accepter+le+contrat+de+location.`);
  }

  if (!listing.modesRemise.includes(modeRemise)) {
    redirect(`/annonce/${listing.slug}?erreur=Mode+de+remise+invalide.`);
  }

  // Durée choisie : demi-journée, jours ou semaines (voir periodeLocation.ts).
  const periode = construirePeriode({
    formule: String(formData.get("formule") ?? ""),
    date: String(formData.get("dateDebut") ?? ""),
    creneau: String(formData.get("creneau") ?? ""),
    dateFin: String(formData.get("dateFin") ?? ""),
    nbSemaines: String(formData.get("nbSemaines") ?? ""),
  });

  if ("erreur" in periode) {
    redirect(`/annonce/${listing.slug}?erreur=${encodeURIComponent(periode.erreur)}`);
  }

  const { dateDebut, dateFin } = periode;
  const aujourdhui = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  if (dateDebut < aujourdhui) {
    redirect(`/annonce/${listing.slug}?erreur=${encodeURIComponent("La date de début est déjà passée.")}`);
  }

  if (formData.get("formule") === "demi_journee" && listing.prixDemiJournee == null) {
    redirect(`/annonce/${listing.slug}?erreur=${encodeURIComponent("Cet objet ne se loue pas à la demi-journée.")}`);
  }

  const disponible = await estDisponible(listing.id, dateDebut, dateFin);
  if (!disponible) {
    redirect(`/annonce/${listing.slug}?erreur=Ces+dates+ne+sont+plus+disponibles.`);
  }

  // --- Calcul du prix (section 9.1) ---
  const { montant: montantLocation, palierPrincipal } = calculerPrixLocation(dateDebut, dateFin, {
    demiJournee: listing.prixDemiJournee ? Number(listing.prixDemiJournee) : undefined,
    journee: listing.prixJournee ? Number(listing.prixJournee) : undefined,
    semaine: listing.prixSemaine ? Number(listing.prixSemaine) : undefined,
    mois: listing.prixMois ? Number(listing.prixMois) : undefined,
  });

  const fraisServiceLocataire = calculerFraisLocataire(montantLocation);
  const commissionProprietaire = arrondiCentimes(montantLocation * TAUX_COMMISSION_PROPRIETAIRE);
  const fraisPointRelais = modeRemise === "POINT_RELAIS" ? FRAIS_POINT_RELAIS : null;
  const montantCaution = listing.montantCaution ? Number(listing.montantCaution) : 0;

  const montantTotalLocataire = Math.round(
    (montantLocation + fraisServiceLocataire + (fraisPointRelais ?? 0)) * 100
  ) / 100;

  // --- Booking (statut RESERVEE tant que le paiement n'est pas confirmé) ---
  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      locataireId: user.id,
      proprietaireId: listing.proprietaireId,
      dateDebut,
      dateFin,
      palierApplique: palierPrincipal,
      montantLocation,
      fraisServiceLocataire,
      commissionProprietaire,
      fraisPointRelais: fraisPointRelais ?? undefined,
      montantCaution,
      modeRemise,
      statut: "RESERVEE",
      contratAccepteLocataireLe: new Date(),
    },
  });

  // --- Messagerie (section 8) : conversation liée à la réservation, créée
  // dès la réservation pour que locataire et propriétaire échangent sur les
  // modalités de remise (circuit P2P notamment).
  await prisma.conversation.create({
    data: {
      bookingId: booking.id,
      participants: {
        create: [{ userId: user.id }, { userId: listing.proprietaireId }],
      },
    },
  });

  // --- Paiement Stripe (section 11.1) ---
  // Séquestre : la charge est encaissée intégralement sur le compte plateforme
  // (pas de transfer_data ici). Le reversement au propriétaire (net de
  // commission) se fait via un Transfer distinct, déclenché à la clôture
  // après état des lieux validé (Phase 4) — voir src/lib/stripe/reverserProprietaire.ts.
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(montantTotalLocataire * 100),
    currency: "eur",
    metadata: { bookingId: booking.id },
    description: `Location ${listing.titre} (${booking.id})`,
    automatic_payment_methods: { enabled: true },
  });

  // Caution : empreinte carte enregistrée via SetupIntent, débit off-session
  // uniquement en cas de dommage constaté (approche recommandée section 11.1,
  // compatible avec toutes les durées de location — à valider en conditions
  // réelles selon les réseaux de carte).
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: { bookingId: booking.id },
  });

  await prisma.transaction.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntent.id,
      stripeSetupIntentId: setupIntent.id,
      montantTotal: montantTotalLocataire,
      statut: "en_attente",
    },
  });

  redirect(`/reservation/${booking.id}/paiement`);
}
