import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depozloc.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DepozLoc — Louer plutôt qu'acheter, près de chez soi",
    template: "%s — DepozLoc",
  },
  description:
    "DepozLoc est la marketplace de location d'objets entre particuliers et professionnels en France métropolitaine.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DepozLoc",
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
