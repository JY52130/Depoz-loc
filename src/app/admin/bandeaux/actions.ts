"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EmplacementBandeau } from "@prisma/client";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";
import { EMPLACEMENTS_BANDEAU, LONGUEUR_MAX_TEXTE_ALTERNATIF, dateFormulaire, lienBandeauValide } from "@/lib/bandeaux";

// Bandeaux publicitaires des commerçants (voir src/lib/bandeaux.ts).

function retour(message: string, cle: "ok" | "erreur" = "ok"): never {
  revalidatePath("/admin/bandeaux");
  redirect(`/admin/bandeaux?${cle}=${encodeURIComponent(message)}`);
}

function rafraichirPagesPubliques() {
  revalidatePath("/", "layout");
}

export async function ajouterBandeau(formData: FormData) {
  await exigerAdmin();
  const annonceur = String(formData.get("annonceur") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const texteAlternatif = String(formData.get("texteAlternatif") ?? "").trim();
  const lien = lienBandeauValide(String(formData.get("lien") ?? ""));
  const emplacement = String(formData.get("emplacement") ?? "") as EmplacementBandeau;
  const debut = dateFormulaire(String(formData.get("debut") ?? ""));
  const fin = dateFormulaire(String(formData.get("fin") ?? ""), true);

  const erreurs: string[] = [];
  if (!annonceur) erreurs.push("Indiquez le nom du commerçant.");
  if (!imageUrl.startsWith("https://")) erreurs.push("Envoyez l'image du bandeau.");
  if (!texteAlternatif) erreurs.push("Décrivez l'image (texte lu aux personnes aveugles).");
  if (texteAlternatif.length > LONGUEUR_MAX_TEXTE_ALTERNATIF)
    erreurs.push(`La description de l'image doit faire au plus ${LONGUEUR_MAX_TEXTE_ALTERNATIF} caractères.`);
  if (!lien) erreurs.push("Collez l'adresse complète du site du commerçant (elle commence par https://).");
  if (!(emplacement in EMPLACEMENTS_BANDEAU)) erreurs.push("Choisissez l'emplacement.");
  if (!debut || !fin) erreurs.push("Indiquez les dates de début et de fin.");
  else if (fin <= debut) erreurs.push("La date de fin doit être après la date de début.");
  if (erreurs.length > 0) retour(erreurs.join(" "), "erreur");

  await prisma.bandeau.create({
    data: { annonceur, imageUrl, texteAlternatif, lien: lien!, emplacement, debut: debut!, fin: fin! },
  });
  rafraichirPagesPubliques();
  retour(`Bandeau de ${annonceur} enregistré.`);
}

export async function arreterBandeau(formData: FormData) {
  await exigerAdmin();
  const id = String(formData.get("bandeauId") ?? "");
  await prisma.bandeau.updateMany({ where: { id }, data: { actif: false } });
  rafraichirPagesPubliques();
  retour("Bandeau arrêté : il n'est plus affiché.");
}
