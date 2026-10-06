// Livraison par le propriétaire (décision du 6 octobre 2026) : le
// propriétaire qui le souhaite apporte l'objet chez le locataire puis vient
// le rechercher. Dépôt Malin ne transporte rien : le site encaisse le prix
// de la livraison avec la location et le reverse au propriétaire, moins une
// commission de 10 % (0,50 € minimum).
// Ce fichier ne doit dépendre ni de Prisma ni de Stripe (testé seul).
import { arrondiCentimes } from "./constantesReservation";

export const TAUX_COMMISSION_LIVRAISON = 0.1;
export const COMMISSION_LIVRAISON_MINIMUM = 0.5;
export const PRIX_LIVRAISON_MAX = 50; // euros, aller-retour
export const DISTANCE_LIVRAISON_MAX_KM = 50;

/** Part gardée par Dépôt Malin sur les frais de livraison. */
export function calculerCommissionLivraison(fraisLivraison: number): number {
  if (fraisLivraison <= 0) return 0;
  return Math.min(
    fraisLivraison,
    Math.max(COMMISSION_LIVRAISON_MINIMUM, arrondiCentimes(fraisLivraison * TAUX_COMMISSION_LIVRAISON))
  );
}

/** Vérifie le prix et la distance saisis par le propriétaire. */
export function erreursOffreLivraison(prix: number | undefined, distanceKm: number | undefined): string[] {
  const erreurs: string[] = [];
  if (prix == null || !Number.isFinite(prix) || prix <= 0 || prix > PRIX_LIVRAISON_MAX) {
    erreurs.push(`Le prix de la livraison doit être compris entre 0,01 € et ${PRIX_LIVRAISON_MAX} €.`);
  }
  if (
    distanceKm == null ||
    !Number.isInteger(distanceKm) ||
    distanceKm < 1 ||
    distanceKm > DISTANCE_LIVRAISON_MAX_KM
  ) {
    erreurs.push(`La distance de livraison doit être un nombre entier de 1 à ${DISTANCE_LIVRAISON_MAX_KM} km.`);
  }
  return erreurs;
}

/** Distance à vol d'oiseau entre deux points, en kilomètres. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Montant reversé au propriétaire à la clôture : location + livraison, moins les commissions. */
export function montantReverseProprietaire(booking: {
  montantLocation: number;
  commissionProprietaire: number;
  fraisLivraison?: number | null;
  commissionLivraison?: number | null;
}): number {
  return arrondiCentimes(
    booking.montantLocation -
      booking.commissionProprietaire +
      (booking.fraisLivraison ?? 0) -
      (booking.commissionLivraison ?? 0)
  );
}

type Montant = number | { toString(): string } | null | undefined;
const nombre = (m: Montant) => (m == null ? 0 : Number(m));

/** Même calcul, à partir d'une réservation lue en base (montants Decimal). */
export function netProprietaireReservation(booking: {
  montantLocation: Montant;
  commissionProprietaire: Montant;
  fraisLivraison?: Montant;
  commissionLivraison?: Montant;
}): number {
  return montantReverseProprietaire({
    montantLocation: nombre(booking.montantLocation),
    commissionProprietaire: nombre(booking.commissionProprietaire),
    fraisLivraison: nombre(booking.fraisLivraison),
    commissionLivraison: nombre(booking.commissionLivraison),
  });
}

export type ModeRemise = "P2P" | "POINT_RELAIS" | "LIVRAISON";
const MODES_REMISE: ModeRemise[] = ["P2P", "POINT_RELAIS", "LIVRAISON"];

/** Lit les champs « modes de remise » d'un formulaire d'annonce. */
export function lireModesRemise(formData: FormData): {
  modesRemise: ModeRemise[];
  prixLivraison: number | null;
  distanceLivraisonKm: number | null;
  erreurs: string[];
} {
  const modesRemise = MODES_REMISE.filter((m) => formData.getAll("modesRemise").includes(m));
  const erreurs: string[] = [];
  if (modesRemise.length === 0) erreurs.push("Au moins un mode de remise doit être sélectionné.");

  if (!modesRemise.includes("LIVRAISON")) {
    return { modesRemise, prixLivraison: null, distanceLivraisonKm: null, erreurs };
  }
  const texte = (champ: string) => String(formData.get(champ) ?? "").trim().replace(",", ".");
  const prix = texte("prixLivraison") === "" ? undefined : Number(texte("prixLivraison"));
  const distance = texte("distanceLivraisonKm") === "" ? undefined : Number(texte("distanceLivraisonKm"));
  erreurs.push(...erreursOffreLivraison(prix, distance));
  return {
    modesRemise,
    prixLivraison: prix != null && Number.isFinite(prix) ? arrondiCentimes(prix) : null,
    distanceLivraisonKm: distance ?? null,
    erreurs,
  };
}
