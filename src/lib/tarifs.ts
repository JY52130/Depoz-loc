// Calcul du prix de location selon les tarifs par palier (section 9.1).
// Le propriétaire active jusqu'à 4 paliers optionnels (demi-journée, journée,
// semaine, mois) ; on applique la combinaison la moins chère pour couvrir la
// durée demandée (on peut "dépasser" la durée exacte si c'est plus avantageux,
// ex. prendre un tarif semaine pour 6 jours si moins cher que 6 × jour).
//
// Hypothèse (à confirmer) : 1 semaine = 7 jours, 1 mois = 30 jours.

export type TarifsPaliers = {
  demiJournee?: number;
  journee?: number;
  semaine?: number;
  mois?: number;
};

type Palier = { nom: string; uniteDemiJournees: number; prix: number };

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

function joursInclusifs(dateDebut: Date, dateFin: Date): number {
  const diff = Math.round((dateFin.getTime() - dateDebut.getTime()) / MS_PAR_JOUR);
  return Math.max(1, diff + 1); // ex: même jour = 1 jour ; J à J+2 = 3 jours
}

function paliersDisponibles(tarifs: TarifsPaliers): Palier[] {
  const paliers: Palier[] = [];
  if (tarifs.demiJournee != null) paliers.push({ nom: "demi_journee", uniteDemiJournees: 1, prix: tarifs.demiJournee });
  if (tarifs.journee != null) paliers.push({ nom: "journee", uniteDemiJournees: 2, prix: tarifs.journee });
  if (tarifs.semaine != null) paliers.push({ nom: "semaine", uniteDemiJournees: 14, prix: tarifs.semaine });
  if (tarifs.mois != null) paliers.push({ nom: "mois", uniteDemiJournees: 60, prix: tarifs.mois });
  return paliers;
}

export type ResultatTarification = {
  montant: number;
  palierPrincipal: string; // le palier le plus "grand" utilisé, pour affichage/traçabilité (Booking.palierApplique)
  detail: { palier: string; quantite: number; sousTotal: number }[];
};

/**
 * Calcule le prix total le moins cher pour couvrir [dateDebut, dateFin]
 * à partir des paliers activés par le propriétaire.
 */
export function calculerPrixLocation(
  dateDebut: Date,
  dateFin: Date,
  tarifs: TarifsPaliers
): ResultatTarification {
  const paliers = paliersDisponibles(tarifs);
  if (paliers.length === 0) {
    throw new Error("Aucun tarif n'est configuré sur cette annonce.");
  }

  const jours = joursInclusifs(dateDebut, dateFin);
  const uniteCible = jours * 2; // en demi-journées

  // dp[u] = coût minimum pour couvrir AU MOINS u demi-journées.
  const dp: number[] = new Array(uniteCible + 1).fill(Infinity);
  const choix: (Palier | null)[] = new Array(uniteCible + 1).fill(null);
  dp[0] = 0;

  for (let u = 1; u <= uniteCible; u++) {
    for (const palier of paliers) {
      const reste = Math.max(0, u - palier.uniteDemiJournees);
      const cout = dp[reste] + palier.prix;
      if (cout < dp[u]) {
        dp[u] = cout;
        choix[u] = palier;
      }
    }
  }

  // Reconstruction du détail (quantité par palier utilisé).
  const quantites = new Map<string, { quantite: number; prixUnitaire: number }>();
  let u = uniteCible;
  let garde = 0;
  while (u > 0 && garde < 10_000) {
    const palier = choix[u];
    if (!palier) break; // ne devrait pas arriver si paliers.length > 0
    const entry = quantites.get(palier.nom) ?? { quantite: 0, prixUnitaire: palier.prix };
    entry.quantite += 1;
    quantites.set(palier.nom, entry);
    u = Math.max(0, u - palier.uniteDemiJournees);
    garde++;
  }

  const detail = Array.from(quantites.entries()).map(([palier, { quantite, prixUnitaire }]) => ({
    palier,
    quantite,
    sousTotal: Math.round(quantite * prixUnitaire * 100) / 100,
  }));

  // Le palier "principal" = celui avec la plus grande unité parmi ceux utilisés
  // (utile pour renseigner Booking.palierApplique de façon lisible).
  const palierPrincipal =
    detail.length === 1
      ? detail[0].palier
      : "combinaison";

  return {
    montant: Math.round(dp[uniteCible] * 100) / 100,
    palierPrincipal,
    detail,
  };
}
