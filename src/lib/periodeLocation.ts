// Période de location choisie par le locataire : demi-journée (matin ou
// après-midi), un ou plusieurs jours, ou une ou plusieurs semaines.
//
// Convention de stockage (Booking.dateDebut / dateFin, en UTC) :
// - jours et semaines : du premier jour à 00:00 au dernier jour à 23:59:59.999 ;
// - matin : 00:00 → 11:59:59.999 ; après-midi : 12:00 → 23:59:59.999.
// Ainsi deux réservations du même objet ne se chevauchent pas (voir
// estDisponible), et une demi-journée bloque bien une journée entière.
// Les heures exactes de remise sont convenues par la messagerie.

export type FormuleLocation = "demi_journee" | "jours" | "semaines";
export type Creneau = "matin" | "apres_midi";

export const MS_PAR_JOUR = 24 * 60 * 60 * 1000;
const MS_DEMI_JOURNEE = MS_PAR_JOUR / 2;
export const SEMAINES_MAX = 8;

export type Periode = { dateDebut: Date; dateFin: Date };

/** Lit une date "AAAA-MM-JJ" (champ date du formulaire) à minuit UTC. */
export function lireDate(valeur: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return null;
  const d = new Date(valeur + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function construirePeriode(saisie: {
  formule: string;
  date: string;
  creneau?: string;
  dateFin?: string;
  nbSemaines?: string | number;
}): Periode | { erreur: string } {
  const debut = lireDate(saisie.date);
  if (!debut) return { erreur: "Choisissez une date de début." };

  if (saisie.formule === "demi_journee") {
    if (saisie.creneau !== "matin" && saisie.creneau !== "apres_midi") {
      return { erreur: "Choisissez le matin ou l'après-midi." };
    }
    const depart = debut.getTime() + (saisie.creneau === "apres_midi" ? MS_DEMI_JOURNEE : 0);
    return { dateDebut: new Date(depart), dateFin: new Date(depart + MS_DEMI_JOURNEE - 1) };
  }

  if (saisie.formule === "jours") {
    const fin = lireDate(saisie.dateFin ?? "");
    if (!fin) return { erreur: "Choisissez une date de fin." };
    if (fin < debut) return { erreur: "La date de fin doit être après la date de début." };
    return { dateDebut: debut, dateFin: new Date(fin.getTime() + MS_PAR_JOUR - 1) };
  }

  if (saisie.formule === "semaines") {
    const nb = Number(saisie.nbSemaines);
    if (!Number.isInteger(nb) || nb < 1 || nb > SEMAINES_MAX) {
      return { erreur: `Choisissez entre 1 et ${SEMAINES_MAX} semaines.` };
    }
    return { dateDebut: debut, dateFin: new Date(debut.getTime() + nb * 7 * MS_PAR_JOUR - 1) };
  }

  return { erreur: "Choisissez une durée de location." };
}

function jourUTC(d: Date): number {
  return Math.floor(d.getTime() / MS_PAR_JOUR);
}

/** Vrai si la période est une demi-journée (moins de 12 heures). */
export function estDemiJournee(dateDebut: Date, dateFin: Date): boolean {
  const duree = dateFin.getTime() - dateDebut.getTime();
  return duree > 0 && duree < MS_DEMI_JOURNEE;
}

/** Durée de la location en demi-journées (1 = une demi-journée, 2 = un jour…). */
export function nombreDemiJournees(dateDebut: Date, dateFin: Date): number {
  if (estDemiJournee(dateDebut, dateFin)) return 1;
  return Math.max(1, jourUTC(dateFin) - jourUTC(dateDebut) + 1) * 2;
}

function formaterDate(d: Date, options: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString("fr-FR", { ...options, timeZone: "UTC" });
}

/** Ex. : « le 10 octobre 2026 (matin) » ou « du 10 octobre 2026 au 12 octobre 2026 ». */
export function libellePeriode(
  dateDebut: Date,
  dateFin: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  if (estDemiJournee(dateDebut, dateFin)) {
    const moment = dateDebut.getUTCHours() < 12 ? "matin" : "après-midi";
    return `le ${formaterDate(dateDebut, options)} (${moment})`;
  }
  if (jourUTC(dateDebut) === jourUTC(dateFin)) {
    return `le ${formaterDate(dateDebut, options)} (journée)`;
  }
  return `du ${formaterDate(dateDebut, options)} au ${formaterDate(dateFin, options)}`;
}
