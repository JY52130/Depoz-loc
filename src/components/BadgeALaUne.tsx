// Badge des annonces mises en avant (service payant, voir src/lib/miseEnAvant.ts).
// Le texte « À la une » est lu par les lecteurs d'écran : l'information ne
// passe pas que par la couleur (RGAA 3.1).
export function BadgeALaUne() {
  return (
    <span className="mb-2 inline-block rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-amber-900">
      ★ À la une
    </span>
  );
}

export function classeCarte(miseEnAvant: boolean): string {
  return miseEnAvant
    ? "rounded-xl border-2 border-accent bg-white p-4 shadow-sm"
    : "rounded-xl border bg-white p-4 shadow-sm";
}
