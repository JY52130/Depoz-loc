// Constante partagée client/serveur — AUCUNE dépendance serveur (next/headers)
// car importée depuis un composant client (ConsentementBanner).
export const COOKIE_CONSENTEMENT = "depotmalin_consentement";
export type ValeurConsentement = "accepte" | "refuse";
