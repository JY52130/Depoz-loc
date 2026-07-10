// Calcul de la caution automatique (section 9.2).
// Montant = prix neuf estimé × coefficient de vétusté (fonction de l'âge déclaré),
// avec un plancher minimum.

export type AgeMateriel = "< 1 an" | "1-3 ans" | "3-5 ans" | "> 5 ans";

export const AGES_MATERIEL: AgeMateriel[] = ["< 1 an", "1-3 ans", "3-5 ans", "> 5 ans"];

// Coefficients proposés dans la base de connaissance (à ajuster si besoin).
const COEFFICIENTS_VETUSTE: Record<AgeMateriel, number> = {
  "< 1 an": 0.9,
  "1-3 ans": 0.7,
  "3-5 ans": 0.5,
  "> 5 ans": 0.3,
};

// Valeur par défaut à confirmer avec le client (non spécifiée dans la base de
// connaissance) — évite des cautions dérisoires sur du matériel bon marché.
export const PLANCHER_MINIMUM_CAUTION = 20;

export function calculerCaution(prixNeufEstime: number, age: AgeMateriel): number {
  if (prixNeufEstime <= 0) {
    throw new Error("Le prix neuf estimé doit être strictement positif.");
  }

  const coefficient = COEFFICIENTS_VETUSTE[age];
  const montant = prixNeufEstime * coefficient;

  return Math.round(Math.max(montant, PLANCHER_MINIMUM_CAUTION) * 100) / 100;
}
