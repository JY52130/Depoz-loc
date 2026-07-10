"use client";

import { useEffect, useState } from "react";
import { COOKIE_CONSENTEMENT, type ValeurConsentement } from "@/lib/consentementConstantes";

function lireCookie(nom: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nom}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function ecrireConsentement(valeur: ValeurConsentement) {
  const sixMois = 60 * 60 * 24 * 30 * 6;
  document.cookie = `${COOKIE_CONSENTEMENT}=${valeur}; path=/; max-age=${sixMois}; SameSite=Lax`;
}

export function ConsentementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lecture de document.cookie : uniquement disponible côté navigateur,
    // d'où la vérification post-montage plutôt qu'un état dérivé au rendu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(lireCookie(COOKIE_CONSENTEMENT) === null);
  }, []);

  function repondre(valeur: ValeurConsentement) {
    ecrireConsentement(valeur);
    setVisible(false);
    // Rechargement complet plutôt que router.refresh() : le consentement est
    // vérifié côté client (document.cookie) pour ne pas rendre les pages
    // publiques dynamiques (SSG/ISR préservé — priorité SEO/performance).
    window.location.reload();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-700">
          Nous utilisons des cookies pour mesurer l&apos;audience et afficher
          de la publicité (Google AdSense). Vous pouvez accepter ou refuser
          ces cookies non essentiels — voir notre{" "}
          <a href="/cookies" className="underline">
            politique cookies
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => repondre("refuse")}
            className="rounded border px-4 py-2 text-sm"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => repondre("accepte")}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
