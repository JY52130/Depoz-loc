"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function connexion(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/connexion?erreur=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/membre/tableau-de-bord");
}

export async function inscription(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/inscription?erreur=${encodeURIComponent(error.message)}`);
  }

  // NB : selon la config Supabase, une confirmation par email peut être requise
  // avant que la session ne soit active.
  revalidatePath("/", "layout");
  redirect("/membre/tableau-de-bord");
}

export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
