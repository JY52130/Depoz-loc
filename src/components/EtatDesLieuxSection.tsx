"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { creerEtatDesLieux } from "@/app/membre/reservations/[bookingId]/actions";
import { VERIFICATIONS } from "@/lib/etatDesLieux";

type ConditionReport = {
  id: string;
  type: "ENTREE" | "SORTIE";
  auteurType: "PROPRIETAIRE" | "LOCATAIRE" | "STAFF";
  photos: string[];
  notes: string | null;
  createdAt: Date;
};

type BookingLite = {
  id: string;
  statut: string;
  modeRemise: string;
  conditionReports: ConditionReport[];
  contratAccepteLocataireLe: Date | null;
  contratAccepteProprietaireLe: Date | null;
};

const LABELS_AUTEUR: Record<string, string> = {
  PROPRIETAIRE: "Propriétaire",
  LOCATAIRE: "Locataire",
  STAFF: "Équipe Dépôt Malin",
};

function FormulaireEtatDesLieux({ bookingId, type }: { bookingId: string; type: "ENTREE" | "SORTIE" }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function gererUpload(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return;
    setUploadEnCours(true);
    setErreur(null);
    const supabase = createClient();

    try {
      const urls: string[] = [];
      for (const fichier of Array.from(fichiers)) {
        const chemin = `${crypto.randomUUID()}-${fichier.name}`;
        const { error } = await supabase.storage.from("etats-des-lieux").upload(chemin, fichier);
        if (error) throw error;
        const { data } = supabase.storage.from("etats-des-lieux").getPublicUrl(chemin);
        urls.push(data.publicUrl);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch {
      setErreur(
        "Échec de l'envoi des photos. Vérifiez que le bucket Supabase Storage \"etats-des-lieux\" existe et est public."
      );
    } finally {
      setUploadEnCours(false);
    }
  }

  return (
    <form action={creerEtatDesLieux} className="mt-3 flex flex-col gap-2 rounded border border-dashed p-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />

      <fieldset className="flex flex-col gap-1.5 text-sm">
        <legend className="mb-1 font-medium">
          {type === "ENTREE" ? "À vérifier ensemble au moment de la remise" : "À vérifier ensemble au retour"}
        </legend>
        {VERIFICATIONS[type].map((v) => (
          <label key={v.id} className="flex items-start gap-2">
            <input type="checkbox" name="verifications" value={v.id} className="mt-1 h-4 w-4 shrink-0" />
            {v.libelle}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Photos de l&apos;objet
        <input type="file" accept="image/*" multiple onChange={(e) => gererUpload(e.target.files)} />
      </label>
      <div aria-live="polite">
        {uploadEnCours && <p className="text-sm text-gray-600">Envoi en cours…</p>}
        {erreur && <p className="text-sm text-red-700">{erreur}</p>}
        {!uploadEnCours && photos.length > 0 && (
          <p className="text-sm text-gray-600">{photos.length} photo(s) ajoutée(s).</p>
        )}
      </div>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <Image key={url} src={url} alt="" width={64} height={64} className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Remarques (état, défauts, rayures…)
        <textarea name="notes" rows={2} className="rounded-lg border px-3 py-2" />
      </label>

      <button type="submit" className="w-fit rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
        Déposer mon état des lieux {type === "ENTREE" ? "d'entrée" : "de sortie"}
      </button>
    </form>
  );
}

export function EtatDesLieuxSection({ booking }: { booking: BookingLite }) {
  const rapportsEntree = booking.conditionReports.filter((r) => r.type === "ENTREE");
  const rapportsSortie = booking.conditionReports.filter((r) => r.type === "SORTIE");

  const contratAccepte = Boolean(booking.contratAccepteLocataireLe && booking.contratAccepteProprietaireLe);
  const peutDeposerEntree = booking.statut === "EN_COURS" && contratAccepte;
  const peutDeposerSortie = booking.statut === "EN_COURS" || booking.statut === "RETOURNEE";

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">États des lieux</h2>
      {booking.modeRemise === "POINT_RELAIS" && (
        <p className="mt-1 text-sm text-gray-600">
          Location par un commerçant relais : prenez vos photos au moment du
          dépôt et du retrait chez le commerçant.
        </p>
      )}

      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-600">Entrée (remise)</h3>
        {rapportsEntree.length === 0 ? (
          <p className="mt-1 text-sm text-gray-500">Aucun état des lieux d&apos;entrée déposé.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {rapportsEntree.map((r) => (
              <li key={r.id} className="whitespace-pre-line">
                {LABELS_AUTEUR[r.auteurType]} · {r.photos.length} photo(s){r.notes ? `\n${r.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
        {peutDeposerEntree && <FormulaireEtatDesLieux bookingId={booking.id} type="ENTREE" />}
        {booking.statut === "EN_COURS" && !contratAccepte && (
          <p className="mt-1 text-sm text-gray-600">
            L&apos;état des lieux d&apos;entrée sera possible une fois le contrat accepté par les deux parties.
          </p>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">Sortie (retour)</h3>
        {rapportsSortie.length === 0 ? (
          <p className="mt-1 text-sm text-gray-500">Aucun état des lieux de sortie déposé.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {rapportsSortie.map((r) => (
              <li key={r.id} className="whitespace-pre-line">
                {LABELS_AUTEUR[r.auteurType]} · {r.photos.length} photo(s){r.notes ? `\n${r.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
        {peutDeposerSortie && <FormulaireEtatDesLieux bookingId={booking.id} type="SORTIE" />}
      </div>
    </section>
  );
}
