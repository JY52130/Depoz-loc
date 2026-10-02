"use client";

export function BoutonImprimer() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-50 print:hidden"
    >
      Imprimer ou enregistrer en PDF
    </button>
  );
}
