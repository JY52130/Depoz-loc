"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";
import { lienPublicationValide } from "@/lib/promotionReseaux";
import { notifierPromotionPubliee } from "@/lib/email/notifications";

// Promotions sur les réseaux sociaux : l'admin publie l'annonce sur les pages
// Facebook / Instagram de Dépôt Malin, puis colle ici le lien de la
// publication ; le propriétaire est prévenu par e-mail.

function retour(message: string, cle: "ok" | "erreur" = "ok"): never {
  revalidatePath("/admin/promotions");
  redirect(`/admin/promotions?${cle}=${encodeURIComponent(message)}`);
}

export async function marquerPromotionPubliee(formData: FormData) {
  await exigerAdmin();
  const id = String(formData.get("promotionId") ?? "");
  const lien = lienPublicationValide(String(formData.get("lienPublication") ?? ""));
  if (!lien) retour("Collez le lien complet de la publication (il commence par https://).", "erreur");

  const promotion = await prisma.promotionReseaux.findUnique({
    where: { id },
    include: { listing: { select: { titre: true } }, user: { select: { email: true } } },
  });
  if (!promotion) retour("Promotion introuvable.", "erreur");

  await prisma.promotionReseaux.update({
    where: { id },
    data: { statut: "PUBLIEE", lienPublication: lien, publieeLe: promotion.publieeLe ?? new Date() },
  });
  if (promotion.statut === "A_FAIRE") {
    await notifierPromotionPubliee({
      emailProprietaire: promotion.user.email,
      titreAnnonce: promotion.listing.titre,
      lienPublication: lien,
    });
  }
  revalidatePath("/membre/mes-annonces");
  retour("Promotion enregistrée comme publiée : le propriétaire est prévenu.");
}
