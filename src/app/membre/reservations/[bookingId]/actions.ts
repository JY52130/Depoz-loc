"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { reverserProprietaire } from "@/lib/stripe/reverserProprietaire";
import { notifierClotureLocation, notifierLitigeOuvert } from "@/lib/email/notifications";
import { notesAvecVerifications } from "@/lib/etatDesLieux";

async function verifierParticipant(bookingId: string) {
  const user = await getOrCreateUser();
  if (!user) redirect(`/connexion?redirect=/membre/reservations/${bookingId}`);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || (booking.locataireId !== user.id && booking.proprietaireId !== user.id)) {
    throw new Error("Accès non autorisé à cette réservation.");
  }

  return { user, booking };
}

export async function creerEtatDesLieux(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const type = String(formData.get("type") ?? "") as "ENTREE" | "SORTIE";
  if (type !== "ENTREE" && type !== "SORTIE") throw new Error("Type d'état des lieux invalide.");
  const notes = notesAvecVerifications(
    type,
    formData.getAll("verifications").map(String),
    String(formData.get("notes") ?? "")
  );

  let photos: string[] = [];
  try {
    photos = JSON.parse(String(formData.get("photos") ?? "[]"));
  } catch {
    photos = [];
  }

  const { user, booking } = await verifierParticipant(bookingId);
  const auteurType = booking.locataireId === user.id ? "LOCATAIRE" : "PROPRIETAIRE";

  // La remise de l'objet suppose un contrat accepté par les deux parties.
  if (type === "ENTREE" && (!booking.contratAccepteLocataireLe || !booking.contratAccepteProprietaireLe)) {
    redirect(
      `/membre/reservations/${bookingId}?erreur=${encodeURIComponent(
        "Le contrat de location doit être accepté par les deux parties avant la remise de l'objet."
      )}`
    );
  }

  await prisma.conditionReport.create({
    data: {
      bookingId,
      type,
      auteurType,
      auteurId: user.id,
      photos,
      notes: notes || undefined,
    },
  });

  // Passage RETOURNEE dès qu'un état des lieux de sortie est déposé (section 6.4) —
  // la clôture effective (libération de caution + reversement) est une étape
  // distincte, déclenchée par validerRetourSansDommage ou par un litige.
  if (type === "SORTIE" && booking.statut === "EN_COURS") {
    await prisma.booking.update({ where: { id: bookingId }, data: { statut: "RETOURNEE" } });
  }

  revalidatePath(`/membre/reservations/${bookingId}`);
  redirect(`/membre/reservations/${bookingId}`);
}

export async function accepterContrat(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const { user, booking } = await verifierParticipant(bookingId);

  if (booking.statut === "ANNULEE") {
    throw new Error("Cette réservation est annulée.");
  }

  const estProprietaire = booking.proprietaireId === user.id;
  const dejaAccepte = estProprietaire
    ? booking.contratAccepteProprietaireLe
    : booking.contratAccepteLocataireLe;

  if (!dejaAccepte) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: estProprietaire
        ? { contratAccepteProprietaireLe: new Date() }
        : { contratAccepteLocataireLe: new Date() },
    });
  }

  revalidatePath(`/membre/reservations/${bookingId}`);
  redirect(`/membre/reservations/${bookingId}`);
}

export async function validerRetourSansDommage(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const { user, booking } = await verifierParticipant(bookingId);

  if (booking.proprietaireId !== user.id) {
    throw new Error("Seul le propriétaire peut confirmer le retour et débloquer le paiement.");
  }
  if (booking.statut !== "RETOURNEE") {
    throw new Error("Cette réservation n'est pas au statut RETOURNEE.");
  }

  try {
    await reverserProprietaire(bookingId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Échec du reversement.";
    redirect(`/membre/reservations/${bookingId}?erreur=${encodeURIComponent(message)}`);
  }

  const bookingComplet = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: true,
      locataire: { select: { email: true } },
      proprietaire: { select: { email: true } },
    },
  });
  if (bookingComplet) {
    await notifierClotureLocation({
      emailLocataire: bookingComplet.locataire.email,
      emailProprietaire: bookingComplet.proprietaire.email,
      titreAnnonce: bookingComplet.listing.titre,
    });
  }

  revalidatePath(`/membre/reservations/${bookingId}`);
  revalidatePath("/membre/portefeuille");
  redirect(`/membre/reservations/${bookingId}`);
}

export async function ouvrirLitige(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const motif = String(formData.get("motif") ?? "").trim();
  const { user, booking } = await verifierParticipant(bookingId);

  if (!["EN_COURS", "RETOURNEE"].includes(booking.statut)) {
    throw new Error("Un litige ne peut être ouvert qu'entre la remise et la clôture de la location.");
  }
  if (!motif) {
    redirect(`/membre/reservations/${bookingId}`);
  }

  await prisma.dispute.create({
    data: {
      bookingId,
      ouvertParId: user.id,
      motif,
      statut: "OUVERT",
    },
  });

  const bookingMisAJour = await prisma.booking.update({
    where: { id: bookingId },
    data: { statut: "LITIGE" },
    include: {
      listing: true,
      locataire: { select: { email: true } },
      proprietaire: { select: { email: true } },
    },
  });

  const emailAutrePartie =
    booking.locataireId === user.id ? bookingMisAJour.proprietaire.email : bookingMisAJour.locataire.email;

  await notifierLitigeOuvert({
    emailAutrePartie,
    titreAnnonce: bookingMisAJour.listing.titre,
    motif,
    bookingId,
  });

  revalidatePath(`/membre/reservations/${bookingId}`);
  redirect(`/membre/reservations/${bookingId}`);
}

export async function creerAvis(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const note = Number(formData.get("note") ?? 0);
  const commentaire = String(formData.get("commentaire") ?? "").trim();

  const { user, booking } = await verifierParticipant(bookingId);

  if (booking.statut !== "CLOTUREE") {
    throw new Error("Les avis ne sont possibles qu'une fois la location clôturée.");
  }
  if (note < 1 || note > 5) {
    throw new Error("La note doit être comprise entre 1 et 5.");
  }

  const cibleId = booking.locataireId === user.id ? booking.proprietaireId : booking.locataireId;

  const dejaNote = await prisma.review.findFirst({
    where: { bookingId, auteurId: user.id },
  });
  if (dejaNote) {
    redirect(`/membre/reservations/${bookingId}`);
  }

  await prisma.review.create({
    data: {
      bookingId,
      auteurId: user.id,
      cibleId,
      note,
      commentaire: commentaire || undefined,
    },
  });

  // Recalcul de la note moyenne (section 6.5).
  const avisRecus = await prisma.review.findMany({ where: { cibleId }, select: { note: true } });
  const moyenne =
    avisRecus.reduce((somme, r) => somme + r.note, 0) / avisRecus.length;

  await prisma.user.update({
    where: { id: cibleId },
    data: { noteMoyenne: Math.round(moyenne * 10) / 10 },
  });

  revalidatePath(`/membre/reservations/${bookingId}`);
  redirect(`/membre/reservations/${bookingId}`);
}

export async function envoyerMessage(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const contenu = String(formData.get("contenu") ?? "").trim();
  const { user } = await verifierParticipant(bookingId);

  if (!contenu) {
    redirect(`/membre/reservations/${bookingId}`);
  }

  const conversation = await prisma.conversation.findUnique({ where: { bookingId } });
  if (!conversation) {
    redirect(`/membre/reservations/${bookingId}`);
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      expediteurId: user.id,
      contenu,
    },
  });

  revalidatePath(`/membre/reservations/${bookingId}`);
  redirect(`/membre/reservations/${bookingId}`);
}
