import type { CapacitorConfig } from "@capacitor/cli";

// Encapsulation mobile en webview (conforme au choix V1 — voir section 14).
// L'app native ne fait qu'afficher le site web déployé : pas de build
// statique séparé, tout le contenu (SSG/ISR, auth, paiements) reste servi
// par le déploiement Next.js/Vercel.
const config: CapacitorConfig = {
  appId: "fr.depozloc.app",
  appName: "DepozLoc",
  // À remplacer par l'URL de production une fois déployée. En développement,
  // pointez vers votre instance `npm run dev` exposée (ex: via ngrok) pour
  // tester sur un appareil physique.
  server: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://depozloc.fr",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
