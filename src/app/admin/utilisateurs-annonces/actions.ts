"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";
import { finPeriodeGratuite } from "@/lib/dureeAnnonce";

export async function approuverAnnonce(formData: FormData) {
  await exigerAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { proprietaire: { select: { statut: true } } },
  });
  if (!annonce) return;
  // Validation = début des 15 jours gratuits (pas de limite pour un Pro).
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      statut: "EN_LIGNE",
      enLigneJusquau: finPeriodeGratuite(new Date(), annonce.proprietaire.statut === "PRO"),
    },
  });
  revalidatePath("/admin/utilisateurs-annonces");
  // Met à jour tout de suite les pages publiques (catégories, villes, fiches).
  revalidatePath("/", "layout");
}

export async function rejeterAnnonce(formData: FormData) {
  await exigerAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "SUSPENDU" } });
  revalidatePath("/admin/utilisateurs-annonces");
  // Met à jour tout de suite les pages publiques (catégories, villes, fiches).
  revalidatePath("/", "layout");
}

export async function suspendreAnnonce(formData: FormData) {
  await exigerAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "SUSPENDU" } });
  revalidatePath("/admin/utilisateurs-annonces");
  // Met à jour tout de suite les pages publiques (catégories, villes, fiches).
  revalidatePath("/", "layout");
}
