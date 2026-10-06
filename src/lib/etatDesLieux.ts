// Liste de vérification de l'état des lieux (idées reprises des conseils des
// sites concurrents, 6 octobre 2026) : cases à cocher au moment de la remise
// et du retour. Les réponses sont ajoutées en tête des notes du rapport
// (pas de colonne en base). Ce fichier ne dépend ni de Prisma ni de React.

export type TypeEtatDesLieux = "ENTREE" | "SORTIE";

export const VERIFICATIONS: Record<TypeEtatDesLieux, { id: string; libelle: string }[]> = {
  ENTREE: [
    { id: "teste", libelle: "L'objet a été testé ensemble et il fonctionne" },
    { id: "accessoires", libelle: "Les accessoires, câbles et pièces prévus sont présents" },
    { id: "notice", libelle: "La notice est remise ou l'utilisation a été expliquée" },
    { id: "defauts", libelle: "Aucun défaut visible (fil dénudé, rouille, pièce cassée), ou défauts notés ci-dessous" },
    { id: "photos", libelle: "Des photos ont été prises sous tous les angles" },
  ],
  SORTIE: [
    { id: "fonctionne", libelle: "L'objet fonctionne toujours" },
    { id: "accessoires", libelle: "Tous les accessoires sont rendus" },
    { id: "propre", libelle: "L'objet est rendu propre" },
    { id: "dommage", libelle: "Aucun nouveau dommage, ou dommages notés ci-dessous" },
    { id: "photos", libelle: "Des photos ont été prises sous tous les angles" },
  ],
};

/** Texte enregistré avec le rapport : cases cochées, cases non cochées, puis les notes libres. */
export function notesAvecVerifications(type: TypeEtatDesLieux, cochees: string[], notes: string): string {
  const liste = VERIFICATIONS[type];
  const oui = liste.filter((v) => cochees.includes(v.id)).map((v) => v.libelle);
  const non = liste.filter((v) => !cochees.includes(v.id)).map((v) => v.libelle);
  return [
    oui.length > 0 ? `Vérifié : ${oui.join(" ; ")}.` : "",
    non.length > 0 ? `Non coché : ${non.join(" ; ")}.` : "",
    notes.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}
