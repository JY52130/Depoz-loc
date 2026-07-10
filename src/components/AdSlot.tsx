"use client";

// Emplacement publicitaire AdSense (section 11.6). Vérifie le consentement
// côté client (document.cookie) plutôt que côté serveur (next/headers) pour
// ne pas forcer le rendu dynamique des pages publiques — priorité SEO/ISR
// (voir aussi AdSenseLoader dans le layout public).
import { useEffect, useState } from "react";
import { COOKIE_CONSENTEMENT } from "@/lib/consentementConstantes";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function consentementDonne(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${COOKIE_CONSENTEMENT}=accepte`);
}

export function AdSlot({ slot }: { slot: string }) {
  const [consenti, setConsenti] = useState(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsenti(consentementDonne());
  }, []);

  useEffect(() => {
    if (!consenti || !client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense pas encore chargé / bloqué par un bloqueur de pub — sans gravité.
    }
  }, [consenti, client]);

  if (!consenti || !client) return null;

  return (
    <div className="my-6">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
