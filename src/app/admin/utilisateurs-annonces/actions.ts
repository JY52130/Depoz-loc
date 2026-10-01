"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";

export async function approuverAnnonce(formData: FormData) {
  await exigerAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "EN_LIGNE" } });
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
