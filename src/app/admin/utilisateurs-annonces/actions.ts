"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";
import { finPeriodeGratuite } from "@/lib/dureeAnnonce";
import { estProActif } from "@/lib/abonnementPro";
import { dateApresMiseEnAvant } from "@/lib/miseEnAvant";
import { placeFondateurDisponible } from "@/lib/offresLancement";

export async function approuverAnnonce(formData: FormData) {
  await exigerAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  const annonce = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      misEnAvantJusquau: true,
      proprietaire: { select: { id: true, statut: true, proActifJusquau: true, fondateurLe: true } },
    },
  });
  if (!annonce) return;
  const maintenant = new Date();

  // Offre de lancement « Membre fondateur » : à la première annonce validée
  // d'un membre, tant qu'il reste des places, badge + 7 jours « À la une ».
  let devientFondateur = false;
  if (!annonce.proprietaire.fondateurLe) {
    const nombreFondateurs = await prisma.user.count({ where: { fondateurLe: { not: null } } });
    devientFondateur = placeFondateurDisponible(nombreFondateurs);
  }
  if (devientFondateur) {
    await prisma.user.update({ where: { id: annonce.proprietaire.id }, data: { fondateurLe: maintenant } });
  }

  // Validation = début des 15 jours gratuits (pas de limite pour un abonné Pro).
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      statut: "EN_LIGNE",
      enLigneJusquau: finPeriodeGratuite(maintenant, estProActif(annonce.proprietaire)),
      ...(devientFondateur ? { misEnAvantJusquau: dateApresMiseEnAvant(annonce.misEnAvantJusquau, maintenant) } : {}),
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
