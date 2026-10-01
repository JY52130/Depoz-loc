// Contrôle de rôle admin pour les server actions du back-office.
// Le layout src/app/admin/layout.tsx protège l'affichage des pages, mais une
// server action peut être appelée directement : chacune doit donc vérifier
// elle-même que l'utilisateur est administrateur.
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function exigerAdmin() {
  const user = await getOrCreateUser();
  if (!user || !user.estAdmin) {
    throw new Error("Accès refusé.");
  }
  return user;
}
