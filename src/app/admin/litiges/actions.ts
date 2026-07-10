"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resoudreLitige } from "@/lib/stripe/resoudreLitige";

// Le contrôle de rôle admin est appliqué dans src/app/admin/layout.tsx.
export async function resoudreLitigeAction(formData: FormData) {
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
