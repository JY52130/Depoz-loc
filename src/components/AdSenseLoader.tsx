"use client";

// Charge le script AdSense uniquement si le consentement a été donné,
// vérifié côté client pour préserver le rendu statique (SSG/ISR) des pages
// publiques — voir AdSlot.tsx pour le même principe sur les emplacements.
import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENTEMENT } from "@/lib/consentementConstantes";

export function AdSenseLoader() {
  const [consenti, setConsenti] = useState(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsenti(document.cookie.includes(`${COOKIE_CONSENTEMENT}=accepte`));
  }, []);

  if (!consenti || !client) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
