import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

export default function robots(): MetadataRoute.Robots {
  // Site caché avant le lancement : on demande aux moteurs de recherche de ne rien indexer.
  if (process.env.SITE_MOT_DE_PASSE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/membre", "/admin", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
