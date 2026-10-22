"use client";

// Compte une vue du bandeau, une fois par affichage, sans cookie ni suivi :
// seul le compteur du bandeau augmente. Fait côté navigateur pour que les
// pages publiques restent en cache (ISR).
import { useEffect } from "react";

export function CompteurVueBandeau({ bandeauId }: { bandeauId: string }) {
  useEffect(() => {
    fetch(`/api/bandeaux/${bandeauId}/vue`, { method: "POST", keepalive: true }).catch(() => {
      // Sans gravité : la vue n'est simplement pas comptée.
    });
  }, [bandeauId]);
  return null;
}
