// Recherche d'annonces (section 8 / 11.2).
// Deux chemins :
//  - rechercherAnnonces() : filtres classiques via Prisma (catégorie, ville,
//    prix, mode de remise, texte libre) — utilisé quand aucune géolocalisation
//    n'est fournie.
//  - rechercherAnnoncesProximite() : recherche "près de chez moi" via une
//    requête PostGIS brute (ST_DWithin / ST_Distance) sur les colonnes
//    latitude/longitude — nécessite l'extension PostGIS sur la base.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DeliveryMode } from "@prisma/client";
import { annonceVisible } from "@/lib/dureeAnnonce";
import { trierMisesEnAvant } from "@/lib/miseEnAvant";

export type FiltresRecherche = {
  texte?: string;
  categorieSlug?: string;
  ville?: string;
  prixMax?: number;
  modeRemise?: DeliveryMode;
  tri?: "recent" | "prix";
};

export async function rechercherAnnonces(filtres: FiltresRecherche) {
  const where: Prisma.ListingWhereInput = annonceVisible();

  if (filtres.categorieSlug) {
    where.category = { slug: filtres.categorieSlug };
  }

  if (filtres.ville) {
    where.ville = { contains: filtres.ville, mode: "insensitive" };
  }

  if (filtres.modeRemise) {
    where.modesRemise = { has: filtres.modeRemise };
  }

  if (filtres.texte) {
    where.OR = [
      { titre: { contains: filtres.texte, mode: "insensitive" } },
      { description: { contains: filtres.texte, mode: "insensitive" } },
    ];
  }

  if (filtres.prixMax != null) {
    where.OR = [
      ...(where.OR ?? []),
      { prixJournee: { lte: filtres.prixMax } },
      { prixDemiJournee: { lte: filtres.prixMax } },
    ];
  }

  const annonces = await prisma.listing.findMany({
    where,
    include: { category: true },
    orderBy:
      filtres.tri === "prix"
        ? [{ prixJournee: "asc" }]
        : [{ createdAt: "desc" }],
    take: 50,
  });
  return trierMisesEnAvant(annonces);
}

export type ResultatProximite = {
  id: string;
  slug: string;
  titre: string;
  ville: string | null;
  misEnAvantJusquau: Date | null;
  distanceMetres: number;
};

/**
 * Recherche géolocalisée "à proximité" via PostGIS.
 * @param latitude/longitude position de recherche
 * @param rayonKm rayon de recherche en kilomètres
 */
export async function rechercherAnnoncesProximite(
  latitude: number,
  longitude: number,
  rayonKm: number,
  categorieSlug?: string
): Promise<ResultatProximite[]> {
  const rayonMetres = rayonKm * 1000;

  const filtreCategorie = categorieSlug
    ? Prisma.sql`AND c.slug = ${categorieSlug}`
    : Prisma.empty;

  const resultats = await prisma.$queryRaw<ResultatProximite[]>`
    SELECT
      l.id,
      l.slug,
      l.titre,
      l.ville,
      l."misEnAvantJusquau",
      ST_Distance(
        ST_MakePoint(l.longitude, l.latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography
      ) AS "distanceMetres"
    FROM "Listing" l
    JOIN "Category" c ON c.id = l."categoryId"
    WHERE l.statut = 'EN_LIGNE'
      AND (l."enLigneJusquau" IS NULL OR l."enLigneJusquau" > NOW())
      AND l.latitude IS NOT NULL
      AND l.longitude IS NOT NULL
      AND ST_DWithin(
        ST_MakePoint(l.longitude, l.latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography,
        ${rayonMetres}
      )
      ${filtreCategorie}
    ORDER BY "distanceMetres" ASC
    LIMIT 50;
  `;
  return trierMisesEnAvant(resultats);
}
