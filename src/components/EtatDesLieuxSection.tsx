"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { creerEtatDesLieux } from "@/app/membre/reservations/[bookingId]/actions";

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
  STAFF: "Personnel point relais",
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

      <input type="file" accept="image/*" multiple onChange={(e) => gererUpload(e.target.files)} className="text-sm" />
      {uploadEnCours && <p className="text-sm text-gray-500">Envoi en cours…</p>}
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <Image key={url} src={url} alt="" width={64} height={64} className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
      )}

      <textarea
        name="notes"
        placeholder="Notes (état du matériel, remarques…)"
        rows={2}
        className="rounded-lg border px-3 py-2 text-sm"
      />

      <button type="submit" className="w-fit rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
        Déposer mon état des lieux {type === "ENTREE" ? "d'entrée" : "de sortie"}
      </button>
    </form>
  );
}

export function EtatDesLieuxSection({ booking }: { booking: BookingLite }) {
  const rapportsEntree = booking.conditionReports.filter((r) => r.type === "ENTREE");
  const rapportsSortie = booking.conditionReports.filter((r) => r.type === "SORTIE");

  const circuitPointRelais = booking.modeRemise === "POINT_RELAIS";
  const contratAccepte = Boolean(booking.contratAccepteLocataireLe && booking.contratAccepteProprietaireLe);
  const peutDeposerEntree = !circuitPointRelais && booking.statut === "EN_COURS" && contratAccepte;
  const peutDeposerSortie =
    !circuitPointRelais && (booking.statut === "EN_COURS" || booking.statut === "RETOURNEE");

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">États des lieux</h2>
      {circuitPointRelais && (
        <p className="mt-1 text-sm text-gray-500">
          Cette location passe par le point relais : les états des lieux sont
          réalisés par le personnel, à l&apos;entrée et à la sortie.
        </p>
      )}

      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-600">Entrée (remise)</h3>
        {rapportsEntree.length === 0 ? (
          <p className="mt-1 text-sm text-gray-500">Aucun état des lieux d&apos;entrée déposé.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {rapportsEntree.map((r) => (
              <li key={r.id}>
                {LABELS_AUTEUR[r.auteurType]} · {r.photos.length} photo(s){r.notes ? ` · ${r.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
        {peutDeposerEntree && <FormulaireEtatDesLieux bookingId={booking.id} type="ENTREE" />}
        {!circuitPointRelais && booking.statut === "EN_COURS" && !contratAccepte && (
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
              <li key={r.id}>
                {LABELS_AUTEUR[r.auteurType]} · {r.photos.length} photo(s){r.notes ? ` · ${r.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
        {peutDeposerSortie && <FormulaireEtatDesLieux bookingId={booking.id} type="SORTIE" />}
      </div>
    </section>
  );
}
