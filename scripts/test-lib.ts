// Petit script de vérification des fonctions pures (aucune dépendance à la
// base de données) : caution auto-calculée et combinaison de tarifs.
// Lancer avec : npx tsx scripts/test-lib.ts
import { calculerCaution } from "../src/lib/caution";
import { calculerPrixLocation } from "../src/lib/tarifs";
import {
  construirePeriode,
  libellePeriode,
  nombreDemiJournees,
} from "../src/lib/periodeLocation";
import {
  dateApresProlongation,
  estExpiree,
  finPeriodeGratuite,
} from "../src/lib/dureeAnnonce";
import {
  TAUX_COMMISSION_PROPRIETAIRE,
  arrondiCentimes,
  calculerFraisLocataire,
} from "../src/lib/constantesReservation";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "OK  " : "FAIL"} ${label} -> obtenu=${JSON.stringify(actual)} attendu=${JSON.stringify(expected)}`);
  if (!ok) process.exitCode = 1;
}

// --- Caution ---
assertEqual(calculerCaution(100, "< 1 an"), 90, "caution < 1 an");
assertEqual(calculerCaution(100, "1-3 ans"), 70, "caution 1-3 ans");
assertEqual(calculerCaution(100, "3-5 ans"), 50, "caution 3-5 ans");
assertEqual(calculerCaution(100, "> 5 ans"), 30, "caution > 5 ans");
assertEqual(calculerCaution(10, "> 5 ans"), 20, "caution plancher minimum");

// --- Tarification ---
const d = (s: string) => new Date(s + "T00:00:00Z");

assertEqual(
  calculerPrixLocation(d("2026-08-01"), d("2026-08-03"), { journee: 10 }).montant,
  30,
  "3 jours, journee seule"
);

assertEqual(
  calculerPrixLocation(d("2026-08-01"), d("2026-08-07"), { journee: 10, semaine: 50 }).montant,
  50,
  "7 jours, semaine avantageuse"
);

assertEqual(
  calculerPrixLocation(d("2026-08-01"), d("2026-08-10"), { journee: 10, semaine: 50 }).montant,
  80,
  "10 jours, semaine + jours"
);

assertEqual(
  calculerPrixLocation(d("2026-08-01"), d("2026-08-01"), { journee: 10 }).montant,
  10,
  "1 jour (meme date)"
);

// --- Commissions (10 % locataire, 1 € minimum ; 15 % propriétaire) ---
assertEqual(calculerFraisLocataire(25), 2.5, "frais locataire cafetière 25 €");
assertEqual(arrondiCentimes(25 * TAUX_COMMISSION_PROPRIETAIRE), 3.75, "commission propriétaire 25 €");
assertEqual(calculerFraisLocataire(5), 1, "frais locataire minimum 1 €");
assertEqual(calculerFraisLocataire(0), 0, "pas de frais sur 0 €");

// --- Durées de location (demi-journée / jours / semaines) ---
const periode = (saisie: Parameters<typeof construirePeriode>[0]) => {
  const r = construirePeriode(saisie);
  if ("erreur" in r) throw new Error(r.erreur);
  return r;
};

const matin = periode({ formule: "demi_journee", date: "2026-08-01", creneau: "matin" });
assertEqual(nombreDemiJournees(matin.dateDebut, matin.dateFin), 1, "matin = 1 demi-journée");
assertEqual(
  calculerPrixLocation(matin.dateDebut, matin.dateFin, { demiJournee: 6, journee: 10 }).montant,
  6,
  "prix d'une demi-journée"
);
assertEqual(libellePeriode(matin.dateDebut, matin.dateFin), "le 1 août 2026 (matin)", "libellé matin");

const apresMidi = periode({ formule: "demi_journee", date: "2026-08-01", creneau: "apres_midi" });
assertEqual(nombreDemiJournees(apresMidi.dateDebut, apresMidi.dateFin), 1, "après-midi = 1 demi-journée");
assertEqual(
  libellePeriode(apresMidi.dateDebut, apresMidi.dateFin),
  "le 1 août 2026 (après-midi)",
  "libellé après-midi"
);

const unJour = periode({ formule: "jours", date: "2026-08-01", dateFin: "2026-08-01" });
assertEqual(nombreDemiJournees(unJour.dateDebut, unJour.dateFin), 2, "un jour = 2 demi-journées");
assertEqual(
  calculerPrixLocation(unJour.dateDebut, unJour.dateFin, { demiJournee: 6, journee: 10 }).montant,
  10,
  "une journée coûte le tarif journée"
);

const troisJours = periode({ formule: "jours", date: "2026-08-01", dateFin: "2026-08-03" });
assertEqual(
  calculerPrixLocation(troisJours.dateDebut, troisJours.dateFin, { journee: 10 }).montant,
  30,
  "3 jours via le formulaire"
);

const uneSemaine = periode({ formule: "semaines", date: "2026-08-01", nbSemaines: 1 });
assertEqual(nombreDemiJournees(uneSemaine.dateDebut, uneSemaine.dateFin), 14, "1 semaine = 7 jours");
assertEqual(
  calculerPrixLocation(uneSemaine.dateDebut, uneSemaine.dateFin, { journee: 10, semaine: 50 }).montant,
  50,
  "prix d'une semaine"
);

const deuxSemaines = periode({ formule: "semaines", date: "2026-08-01", nbSemaines: 2 });
assertEqual(
  calculerPrixLocation(deuxSemaines.dateDebut, deuxSemaines.dateFin, { journee: 10, semaine: 50 }).montant,
  100,
  "prix de deux semaines"
);

assertEqual(
  construirePeriode({ formule: "jours", date: "2026-08-05", dateFin: "2026-08-01" }),
  { erreur: "La date de fin doit être après la date de début." },
  "date de fin avant le début refusée"
);
assertEqual(
  construirePeriode({ formule: "semaines", date: "2026-08-01", nbSemaines: 0 }),
  { erreur: "Choisissez entre 1 et 8 semaines." },
  "0 semaine refusée"
);
assertEqual(
  construirePeriode({ formule: "demi_journee", date: "2026-08-01" }),
  { erreur: "Choisissez le matin ou l'après-midi." },
  "demi-journée sans créneau refusée"
);

// --- Durée de mise en ligne des annonces (15 jours gratuits, +30 jours) ---
const t0 = new Date("2026-10-05T10:00:00Z");
assertEqual(finPeriodeGratuite(t0, false)?.toISOString(), "2026-10-20T10:00:00.000Z", "15 jours gratuits");
assertEqual(finPeriodeGratuite(t0, true), null, "pas de limite pour un Pro");
assertEqual(
  dateApresProlongation(new Date("2026-10-08T10:00:00Z"), t0).toISOString(),
  "2026-11-07T10:00:00.000Z",
  "prolongation avant expiration : +30 jours après la fin prévue"
);
assertEqual(
  dateApresProlongation(new Date("2026-09-01T10:00:00Z"), t0).toISOString(),
  "2026-11-04T10:00:00.000Z",
  "prolongation après expiration : +30 jours à partir d'aujourd'hui"
);
assertEqual(estExpiree(new Date("2026-10-05T09:00:00Z"), t0), true, "annonce expirée");
assertEqual(estExpiree(new Date("2026-10-06T09:00:00Z"), t0), false, "annonce encore en ligne");
assertEqual(estExpiree(null, t0), false, "sans limite : jamais expirée");

console.log("Terminé.");
