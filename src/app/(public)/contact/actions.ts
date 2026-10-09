"use server";

import { prisma } from "@/lib/prisma";
import { verifierMessageContact } from "@/lib/contact";
import { notifierMessageContact } from "@/lib/email/notifications";

export type EtatContact = {
  envoye: boolean;
  erreurs: string[];
  valeurs: { nom: string; email: string; sujet: string; message: string };
};

export async function envoyerMessageContact(_etat: EtatContact, formData: FormData): Promise<EtatContact> {
  const texte = (champ: string) => String(formData.get(champ) ?? "");
  const valeurs = { nom: texte("nom"), email: texte("email"), sujet: texte("sujet"), message: texte("message") };

  // Champ piège invisible : seuls les robots le remplissent. On fait comme si
  // tout allait bien, sans rien enregistrer.
  if (texte("site")) return { envoye: true, erreurs: [], valeurs };

  const { erreurs, valeur } = verifierMessageContact(valeurs);
  if (!valeur) return { envoye: false, erreurs, valeurs };

  await prisma.messageContact.create({ data: valeur });
  await notifierMessageContact(valeur);
  return { envoye: true, erreurs: [], valeurs: { nom: "", email: "", sujet: "", message: "" } };
}
