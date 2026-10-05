"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { creerReservation } from "@/app/reservation/actions";
import { calculerPrixLocation } from "@/lib/tarifs";
import {
  SEMAINES_MAX,
  construirePeriode,
  libellePeriode,
  type FormuleLocation,
} from "@/lib/periodeLocation";
import {
  FRAIS_POINT_RELAIS,
  TAUX_FRAIS_LOCATAIRE,
  calculerFraisLocataire,
} from "@/lib/constantesReservation";
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

const LABELS_FORMULE: Record<FormuleLocation, string> = {
  demi_journee: "Demi-journée",
  jours: "Jour(s)",
  semaines: "Semaine(s)",
};

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReserverForm({ listingId, slug, modesRemise, tarifs }: Props) {
  // Formules proposées selon les tarifs saisis par le propriétaire.
  const formules: FormuleLocation[] = [
    ...(tarifs.demiJournee != null ? (["demi_journee"] as const) : []),
    "jours",
    ...(tarifs.semaine != null ? (["semaines"] as const) : []),
  ];
  const [formule, setFormule] = useState<FormuleLocation>(
    tarifs.journee == null && tarifs.demiJournee != null
      ? "demi_journee"
      : "jours",
  );
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [creneau, setCreneau] = useState("matin");
  const [nbSemaines, setNbSemaines] = useState("1");
  const [modeRemise, setModeRemise] = useState<DeliveryMode>(modesRemise[0]);

  const apercu = useMemo(() => {
    const periode = construirePeriode({
      formule,
      date: dateDebut,
      creneau,
      dateFin,
      nbSemaines,
    });
    if ("erreur" in periode) return null;

    try {
      const { montant } = calculerPrixLocation(
        periode.dateDebut,
        periode.dateFin,
        tarifs,
      );
      const frais = calculerFraisLocataire(montant);
      const fraisRelais =
        modeRemise === "POINT_RELAIS" ? FRAIS_POINT_RELAIS : 0;
      return {
        periode: libellePeriode(periode.dateDebut, periode.dateFin),
        montant,
        frais,
        fraisRelais,
        total: Math.round((montant + frais + fraisRelais) * 100) / 100,
      };
    } catch {
      return null;
    }
  }, [formule, dateDebut, creneau, dateFin, nbSemaines, modeRemise, tarifs]);

  return (
    <form
      action={creerReservation}
      className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />

      {formules.length > 1 ? (
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1">Durée de location</legend>
          <div className="flex flex-wrap gap-2">
            {formules.map((f) => (
              <label
                key={f}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                  formule === f ? "border-brand bg-brand-50 font-medium" : ""
                }`}
              >
                <input
                  type="radio"
                  name="formule"
                  value={f}
                  checked={formule === f}
                  onChange={() => setFormule(f)}
                  className="h-4 w-4"
                />
                {LABELS_FORMULE[f]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <input type="hidden" name="formule" value={formule} />
      )}

      <div className="flex flex-wrap gap-2">
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-sm">
          {formule === "jours" ? "Du" : "Le"}
          <input
            type="date"
            name="dateDebut"
            required
            min={aujourdhui()}
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>

        {formule === "jours" && (
          <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-sm">
            Au (inclus)
            <input
              type="date"
              name="dateFin"
              required
              min={dateDebut || aujourdhui()}
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
          </label>
        )}

        {formule === "demi_journee" && (
          <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-sm">
            Moment
            <select
              name="creneau"
              value={creneau}
              onChange={(e) => setCreneau(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="matin">Matin</option>
              <option value="apres_midi">Après-midi</option>
            </select>
          </label>
        )}

        {formule === "semaines" && (
          <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-sm">
            Nombre de semaines
            <select
              name="nbSemaines"
              value={nbSemaines}
              onChange={(e) => setNbSemaines(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              {Array.from({ length: SEMAINES_MAX }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n}>
                    {n} semaine{n > 1 ? "s" : ""}
                  </option>
                ),
              )}
            </select>
          </label>
        )}
      </div>

      {formule === "demi_journee" && (
        <p className="text-xs text-gray-600">
          Les heures exactes de remise et de retour se fixent avec le
          propriétaire par la messagerie.
        </p>
      )}

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

      <div aria-live="polite">
        {apercu && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <p>
              Location {apercu.periode} : {apercu.montant} €
            </p>
            <p>
              Frais de service ({TAUX_FRAIS_LOCATAIRE * 100} %) : {apercu.frais}{" "}
              €
            </p>
            {apercu.fraisRelais > 0 && (
              <p>Frais point relais : {apercu.fraisRelais} €</p>
            )}
            <p className="font-medium">Total à payer : {apercu.total} €</p>
          </div>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="accepteContrat"
          required
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          J&apos;ai lu et j&apos;accepte le{" "}
          <Link
            href="/contrat-de-location"
            target="_blank"
            className="text-brand underline"
          >
            contrat de location
            <span className="sr-only">
              {" "}
              (s&apos;ouvre dans un nouvel onglet)
            </span>
          </Link>
          , qui sera rempli avec les informations de cette réservation.
        </span>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Réserver
      </button>
    </form>
  );
}
