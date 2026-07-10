"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { reverserProprietaire } from "@/lib/stripe/reverserProprietaire";
import { notifierClotureLocation } from "@/lib/email/notifications";

async function getRelayPointUnique() {
  const relais = await prisma.relayPoint.findFirst();
  if (!relais) throw new Error("Aucun point relais enregistré (lancez le seed : npx prisma db seed).");
  return relais;
}

export async function enregistrerDepot(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const relais = await getRelayPointUnique();

  await prisma.relayStock.create({
    data: {
      relayPointId: relais.id,
      bookingId,
      statut: "DEPOSE",
      dateDepot: new Date(),
    },
  });

  revalidatePath("/admin/point-relais");
}

export async function enregistrerRetrait(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");

  await prisma.relayStock.update({
    where: { bookingId },
    data: { statut: "RETIRE", dateRetrait: new Date() },
  });

  await prisma.conditionReport.create({
    data: { bookingId, type: "ENTREE", auteurType: "STAFF" },
  });

  revalidatePath("/admin/point-relais");
}

export async function enregistrerRetour(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");

  await prisma.relayStock.update({
    where: { bookingId },
    data: { statut: "RETOURNE", dateRetour: new Date() },
  });

  await prisma.conditionReport.create({
    data: { bookingId, type: "SORTIE", auteurType: "STAFF" },
  });

  await prisma.booking.updateMany({
    where: { id: bookingId, statut: "EN_COURS" },
    data: { statut: "RETOURNEE" },
  });

  revalidatePath("/admin/point-relais");
}

// Clôture pour le circuit point relais : c'est le personnel (pas le
// propriétaire) qui a physiquement inspecté le retour — voir section 5.2.
export async function validerRetourPointRelais(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");

  await reverserProprietaire(bookingId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true, locataire: { select: { email: true } }, proprietaire: { select: { email: true } } },
  });
  if (booking) {
    await notifierClotureLocation({
      emailLocataire: booking.locataire.email,
      emailProprietaire: booking.proprietaire.email,
      titreAnnonce: booking.listing.titre,
    });
  }

  revalidatePath("/admin/point-relais");
  revalidatePath("/membre/portefeuille");
}
