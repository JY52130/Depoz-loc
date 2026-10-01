import type { Metadata } from "next";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
