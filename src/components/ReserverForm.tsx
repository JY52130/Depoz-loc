"use client";

import { useMemo, useState } from "react";
import { creerReservation } from "@/app/reservation/actions";
import { calculerPrixLocation } from "@/lib/tarifs";
import { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";
import type { DeliveryMode } from "@prisma/client";

type Props = {
  listingId: string;
  slug: string;
  modesRemise: DeliveryMode[];
  tarifs: {
    demiJournee?: number;
    journee?: number;
    semaine?: number;
    mois?: number;
  };
};

const LABELS_REMISE: Record<string, string> = {
  P2P: "Main à main",
  POINT_RELAIS: "Point relais (Haute-Marne)",
};

export function ReserverForm({ listingId, slug, modesRemise, tarifs }: Props) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [modeRemise, setModeRemise] = useState<DeliveryMode>(modesRemise[0]);

  const apercu = useMemo(() => {
    if (!dateDebut || !dateFin) return null;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin < debut) return null;

    try {
      const { montant } = calculerPrixLocation(debut, fin, tarifs);
      const frais = Math.round(montant * 0.05 * 100) / 100;
      const fraisRelais = modeRemise === "POINT_RELAIS" ? FRAIS_POINT_RELAIS : 0;
      return { montant, frais, fraisRelais, total: Math.round((montant + frais + fraisRelais) * 100) / 100 };
    } catch {
      return null;
    }
  }, [dateDebut, dateFin, modeRemise, tarifs]);

  return (
    <form action={creerReservation} className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Du
          <input
            type="date"
            name="dateDebut"
            required
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Au
          <input
            type="date"
            name="dateFin"
            required
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>
      </div>

      {modesRemise.length > 1 ? (
        <label className="flex flex-col gap-1 text-sm">
          Mode de remise
          <select
            name="modeRemise"
            value={modeRemise}
            onChange={(e) => setModeRemise(e.target.value as DeliveryMode)}
            className="rounded-lg border px-3 py-2"
          >
            {modesRemise.map((mode) => (
              <option key={mode} value={mode}>
                {LABELS_REMISE[mode] ?? mode}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="modeRemise" value={modeRemise} />
      )}

      {apercu && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
          <p>Location : {apercu.montant} €</p>
          <p>Frais de service (5 %) : {apercu.frais} €</p>
          {apercu.fraisRelais > 0 && <p>Frais point relais : {apercu.fraisRelais} €</p>}
          <p className="font-medium">Total à payer : {apercu.total} €</p>
        </div>
      )}

      <button type="submit" className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark">
        Réserver
      </button>
    </form>
  );
}
