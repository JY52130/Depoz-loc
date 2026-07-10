"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approuverAnnonce(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "EN_LIGNE" } });
  revalidatePath("/admin/utilisateurs-annonces");
}

export async function rejeterAnnonce(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "SUSPENDU" } });
  revalidatePath("/admin/utilisateurs-annonces");
}

export async function suspendreAnnonce(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  await prisma.listing.update({ where: { id: listingId }, data: { statut: "SUSPENDU" } });
  revalidatePath("/admin/utilisateurs-annonces");
}
