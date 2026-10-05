import { prisma } from "@/lib/prisma";
import { annonceVisible } from "@/lib/dureeAnnonce";

/** Annonces mises en avant pour la section « À la une » de l'accueil. */
export async function annoncesALaUne(nombre = 6) {
  const maintenant = new Date();
  return prisma.listing
    .findMany({
      where: { ...annonceVisible(maintenant), misEnAvantJusquau: { gt: maintenant } },
      include: { category: true },
      orderBy: { misEnAvantJusquau: "desc" },
      take: nombre,
    })
    // Base injoignable : la page d'accueil s'affiche sans la section.
    .catch(() => []);
}
