import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

// Sitemap dynamique (section 12.2) : pages statiques + catégories +
// catégorie×ville + fiches annonce en ligne.

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

const pagesStatiques = [
  "",
  "/comment-ca-marche",
  "/points-relais",
  "/tarifs",
  "/blog",
  "/faq",
  "/contact",
  "/cgu",
  "/cgv",
  "/mentions-legales",
  "/confidentialite",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entreesStatiques: MetadataRoute.Sitemap = pagesStatiques.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  // Base injoignable : on renvoie au moins les pages statiques.
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.listing.findMany({
      where: { statut: "EN_LIGNE" },
      select: { slug: true, ville: true, updatedAt: true, category: { select: { slug: true } } },
    }),
  ]).catch(() => [[], []] as const);

  const entreesCategories: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/location/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const villesParCategorie = new Map<string, Set<string>>();
  for (const listing of listings) {
    if (!listing.ville) continue;
    const key = listing.category.slug;
    if (!villesParCategorie.has(key)) villesParCategorie.set(key, new Set());
    villesParCategorie.get(key)!.add(slugify(listing.ville));
  }

  const entreesCategorieVille: MetadataRoute.Sitemap = Array.from(villesParCategorie.entries()).flatMap(
    ([categorieSlug, villes]) =>
      Array.from(villes).map((villeSlug) => ({
        url: `${siteUrl}/location/${categorieSlug}/${villeSlug}`,
        changeFrequency: "daily" as const,
        priority: 0.9,
      }))
  );

  const entreesAnnonces: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${siteUrl}/annonce/${listing.slug}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...entreesStatiques, ...entreesCategories, ...entreesCategorieVille, ...entreesAnnonces];
}
