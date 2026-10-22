import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dépôt Malin — Louer plutôt qu'acheter, près de chez soi",
    template: "%s — Dépôt Malin",
  },
  description:
    "Dépôt Malin est la marketplace de location d'objets entre particuliers et professionnels en France métropolitaine.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Dépôt Malin",
  },
  // Appli installable sur iPhone (« Sur l'écran d'accueil ») : voir manifest.ts.
  appleWebApp: {
    capable: true,
    title: "Dépôt Malin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
