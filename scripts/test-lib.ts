// Petit script de vérification des fonctions pures (aucune dépendance à la
// base de données) : caution auto-calculée et combinaison de tarifs.
// Lancer avec : npx tsx scripts/test-lib.ts
import { calculerCaution } from "../src/lib/caution";
import { calculerPrixLocation } from "../src/lib/tarifs";

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

console.log("Terminé.");
