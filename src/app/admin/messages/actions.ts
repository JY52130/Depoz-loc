"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { prisma } from "@/lib/prisma";

// Messages du formulaire de contact : l'équipe répond par e-mail depuis sa
// messagerie, puis marque le message comme traité.
export async function changerTraitementMessage(formData: FormData) {
  await exigerAdmin();
  await prisma.messageContact.update({
    where: { id: String(formData.get("messageId") ?? "") },
    data: { traite: formData.get("traite") === "true" },
  });
  revalidatePath("/admin/messages");
}
