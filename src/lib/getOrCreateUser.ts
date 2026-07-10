// Fait le lien entre l'utilisateur Supabase Auth (auth.users) et la table
// applicative Prisma "User". Appelé depuis les server actions qui ont besoin
// d'un id User Prisma (création d'annonce, réservation, etc.).
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getOrCreateUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser || !supabaseUser.email) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { supabaseAuthId: supabaseUser.id },
    update: { email: supabaseUser.email },
    create: {
      supabaseAuthId: supabaseUser.id,
      email: supabaseUser.email,
    },
  });

  return user;
}
