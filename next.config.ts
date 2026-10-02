import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos hébergées sur Supabase Storage (annonces-photos, etats-des-lieux).
    // Le sous-domaine de projet Supabase est propre à chaque déploiement,
    // d'où le wildcard — voir section performance (Core Web Vitals).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Photos des catégories de l'accueil (licence Unsplash, gratuite).
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
