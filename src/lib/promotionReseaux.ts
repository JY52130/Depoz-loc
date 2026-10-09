// Service payant « promotion sur les réseaux sociaux » (décision du 9 octobre
// 2026) : le propriétaire paie par Stripe Checkout, le webhook enregistre la
// demande, puis un administrateur publie l'annonce sur les pages Facebook et
// Instagram de Dépôt Malin et colle le lien de la publication dans /admin.

export type CleFormule = "PUBLICATION" | "PUBLICITE";

export const FORMULES_PROMOTION: Record<
  CleFormule,
  { nom: string; prix: number; description: string }
> = {
  PUBLICATION: {
    nom: "Publication sur nos réseaux",
    prix: 2.99,
    description: "Votre annonce est publiée sur les pages Facebook et Instagram de Dépôt Malin.",
  },
  PUBLICITE: {
    nom: "Publicité ciblée 7 jours",
    prix: 9.9,
    description:
      "Votre annonce est diffusée en publicité Facebook et Instagram pendant 7 jours auprès des habitants autour de votre ville.",
  },
};

export function estFormule(valeur: unknown): valeur is CleFormule {
  return valeur === "PUBLICATION" || valeur === "PUBLICITE";
}

/** Prix affiché à la française : 2,99 €, 9,90 €. */
export function prixFormule(cle: CleFormule): string {
  return `${FORMULES_PROMOTION[cle].prix.toFixed(2).replace(".", ",")} €`;
}

/** Lien de publication collé par l'admin : une adresse https, sinon null. */
export function lienPublicationValide(valeur: string): string | null {
  try {
    const url = new URL(valeur.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
