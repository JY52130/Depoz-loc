// Recopie l'état d'une vérification Stripe Identity chez le membre (serveur
// uniquement). Appelé par le webhook et à l'affichage de la page, pour que le
// résultat apparaisse même si un événement Stripe arrive en retard.
import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { etatVerification } from "@/lib/verificationIdentite";

export async function enregistrerEtatVerification(userId: string, session: Stripe.Identity.VerificationSession) {
  const etat = etatVerification(session.status, session.last_error != null);
  const { count } = await prisma.user.updateMany({
    where: { id: userId, stripeVerificationSessionId: session.id, identiteVerifieeLe: null },
    data: {
      statutVerificationIdentite: etat,
      ...(etat === "verified" ? { identiteVerifieeLe: new Date() } : {}),
    },
  });
  if (count > 0 && etat === "verified") revalidatePath("/", "layout");
  return etat;
}

/** Relit la vérification en cours chez Stripe ; renvoie l'état à jour (ou null). */
export async function synchroniserVerification(user: {
  id: string;
  stripeVerificationSessionId: string | null;
  identiteVerifieeLe: Date | null;
}): Promise<string | null> {
  if (!user.stripeVerificationSessionId || user.identiteVerifieeLe) return null;
  const session = await stripe.identity.verificationSessions
    .retrieve(user.stripeVerificationSessionId)
    .catch(() => null);
  if (!session) return null;
  return enregistrerEtatVerification(user.id, session);
}
