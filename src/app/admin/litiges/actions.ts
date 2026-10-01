"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/exigerAdmin";
import { redirect } from "next/navigation";
import { resoudreLitige } from "@/lib/stripe/resoudreLitige";

export async function resoudreLitigeAction(formData: FormData) {
  await exigerAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  const montantCautionRetenu = Number(formData.get("montantCautionRetenu") ?? 0);
  const decision = String(formData.get("decision") ?? "").trim();

  try {
    await resoudreLitige(bookingId, montantCautionRetenu, decision);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Échec de la résolution du litige.";
    redirect(`/admin/litiges?erreur=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/litiges");
  redirect("/admin/litiges?resolu=1");
}
