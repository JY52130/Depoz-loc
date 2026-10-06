"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";
import { geocoderAdresse } from "@/lib/geocodage";

// Commerçants relais (décision du 6 octobre 2026) : des commerces partenaires
// où le propriétaire dépose l'objet et où le locataire le retire. Dépôt
// Malin ne transporte rien ; l'accord avec chaque commerçant se fait hors site.

function retour(message: string, cle: "ok" | "erreur" = "ok"): never {
  revalidatePath("/admin/point-relais");
  revalidatePath("/points-relais");
  redirect(`/admin/point-relais?${cle}=${encodeURIComponent(message)}`);
}

export async function ajouterCommercantRelais(formData: FormData) {
  await exigerAdmin();
  const texte = (champ: string) => String(formData.get(champ) ?? "").trim();
  const nom = texte("nom");
  const adresse = texte("adresse");
  const codePostal = texte("codePostal");
  const ville = texte("ville");
  if (!nom || !adresse || !/^\d{5}$/.test(codePostal) || !ville) {
    retour("Nom, adresse, code postal (5 chiffres) et ville sont obligatoires.", "erreur");
  }

  const geo = await geocoderAdresse(`${adresse} ${codePostal} ${ville}`);
  await prisma.relayPoint.create({
    data: {
      nom,
      adresse,
      codePostal,
      ville,
      horaires: texte("horaires") || null,
      telephone: texte("telephone") || null,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
    },
  });
  retour(`${nom} est ajouté à la liste des commerçants relais.`);
}

export async function changerActivationRelais(formData: FormData) {
  await exigerAdmin();
  const id = String(formData.get("relayPointId") ?? "");
  const actif = formData.get("actif") === "true";
  await prisma.relayPoint.update({ where: { id }, data: { actif } });
  retour(actif ? "Le commerçant est de nouveau proposé." : "Le commerçant n'est plus proposé aux locataires.");
}
