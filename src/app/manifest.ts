import type { MetadataRoute } from "next";

// Rend le site installable comme une application (écran d'accueil du
// téléphone), gratuitement et sans passer par les stores. L'« appli »
// affiche simplement le site en plein écran : bandeaux, paiements et
// comptes fonctionnent comme sur le site.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dépôt Malin — Location entre voisins",
    short_name: "Dépôt Malin",
    description: "Louez et faites louer des objets près de chez vous, à Saint-Dizier et alentour.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff8f0",
    theme_color: "#0f766e",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
