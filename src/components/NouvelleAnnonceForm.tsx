"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { calculerCaution, AGES_MATERIEL, type AgeMateriel } from "@/lib/caution";
import { creerAnnonce } from "@/app/membre/mes-annonces/nouvelle/actions";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";

type Categorie = { id: string; nom: string };

type Disponibilite = { debut: string; fin: string };

export function NouvelleAnnonceForm({ categories }: { categories: Categorie[] }) {
  const [titre, setTitre] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreurUpload, setErreurUpload] = useState<string | null>(null);

  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([{ debut: "", fin: "" }]);

  const [prixNeufEstime, setPrixNeufEstime] = useState<string>("");
  const [ageMateriel, setAgeMateriel] = useState<AgeMateriel>("1-3 ans");
  const [estimationEnCours, setEstimationEnCours] = useState(false);
  const [estimeParIA, setEstimeParIA] = useState(false);
  const [messageEstimation, setMessageEstimation] = useState<string | null>(null);

  const cautionCalculee = useMemo(() => {
    const prix = Number(prixNeufEstime);
    if (!prix || prix <= 0) return null;
    return calculerCaution(prix, ageMateriel);
  }, [prixNeufEstime, ageMateriel]);

  async function gererUploadPhotos(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return;
    setUploadEnCours(true);
    setErreurUpload(null);
    const supabase = createClient();

    try {
      const urls: string[] = [];
      for (const fichier of Array.from(fichiers)) {
        const chemin = `${crypto.randomUUID()}-${fichier.name}`;
        const { error } = await supabase.storage
          .from("annonces-photos")
          .upload(chemin, fichier);

        if (error) throw error;

        const { data } = supabase.storage.from("annonces-photos").getPublicUrl(chemin);
        urls.push(data.publicUrl);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch {
      setErreurUpload(
        "Échec de l'envoi des photos. Vérifiez que le bucket Supabase Storage \"annonces-photos\" existe et est public."
      );
    } finally {
      setUploadEnCours(false);
    }
  }

  async function estimerViaIA() {
    if (!titre.trim()) {
      setMessageEstimation("Renseignez d'abord un titre pour lancer l'estimation.");
      return;
    }
    setEstimationEnCours(true);
    setMessageEstimation(null);

    try {
      const res = await fetch("/api/estimation-caution", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nomMateriel: titre }),
      });
      const data = await res.json();

      if (data.succes) {
        setPrixNeufEstime(String(data.prixNeufEstime));
        setEstimeParIA(true);
        setMessageEstimation(
          `Estimation IA : ${data.prixNeufEstime} € (confiance ${data.confiance}). Vous pouvez corriger cette valeur.`
        );
      } else {
        setMessageEstimation(
          "L'estimation automatique n'a pas abouti — merci de saisir le prix neuf manuellement."
        );
      }
    } catch {
      setMessageEstimation(
        "L'estimation automatique n'a pas abouti — merci de saisir le prix neuf manuellement."
      );
    } finally {
      setEstimationEnCours(false);
    }
  }

  function ajouterDisponibilite() {
    setDisponibilites((prev) => [...prev, { debut: "", fin: "" }]);
  }

  function majDisponibilite(index: number, champ: keyof Disponibilite, valeur: string) {
    setDisponibilites((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [champ]: valeur } : d))
    );
  }

  function supprimerDisponibilite(index: number) {
    setDisponibilites((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={creerAnnonce} className="flex max-w-2xl flex-col gap-8">
      {/* Champs cachés alimentés par l'état React */}
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <input
        type="hidden"
        name="disponibilites"
        value={JSON.stringify(disponibilites.filter((d) => d.debut && d.fin))}
      />
      <input type="hidden" name="estimeParIA" value={estimeParIA ? "true" : "false"} />

      <section>
        <h2 className="text-lg font-semibold">1. Catégorie & description</h2>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Catégorie
            <select name="categoryId" required className="rounded-lg border px-3 py-2">
              <option value="">Choisir une catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Titre de l&apos;annonce
            <input
              name="titre"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="rounded-lg border px-3 py-2"
              placeholder="Ex : Perceuse visseuse Bosch 18V"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Description
            <textarea name="description" required rows={4} className="rounded-lg border px-3 py-2" />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">2. Localisation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Utilisée pour le géocodage (recherche « près de chez moi ») —
          France métropolitaine uniquement.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label className="col-span-2 flex flex-col gap-1 text-sm">
            Adresse (rue)
            <input name="adresse" className="rounded-lg border px-3 py-2" placeholder="Ex : 12 rue de la Gare" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Code postal
            <input name="codePostal" required className="rounded-lg border px-3 py-2" placeholder="52000" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Ville
            <input name="ville" required className="rounded-lg border px-3 py-2" placeholder="Chaumont" />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">3. Photos</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => gererUploadPhotos(e.target.files)}
          className="mt-3 text-sm"
        />
        {uploadEnCours && <p className="mt-2 text-sm text-gray-500">Envoi en cours…</p>}
        {erreurUpload && <p className="mt-2 text-sm text-red-600">{erreurUpload}</p>}
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((url) => (
              <Image key={url} src={url} alt="" width={80} height={80} className="h-20 w-20 rounded object-cover" />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Tarifs par palier</h2>
        <p className="mt-1 text-sm text-gray-500">
          Activez uniquement les paliers souhaités (au moins un requis). La
          combinaison la plus avantageuse sera appliquée automatiquement à la
          réservation.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Demi-journée (€)
            <input name="prixDemiJournee" type="number" min="0" step="0.01" className="rounded-lg border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Journée (€)
            <input name="prixJournee" type="number" min="0" step="0.01" className="rounded-lg border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Semaine (€)
            <input name="prixSemaine" type="number" min="0" step="0.01" className="rounded-lg border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Mois (€)
            <input name="prixMois" type="number" min="0" step="0.01" className="rounded-lg border px-3 py-2" />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">5. Calendrier de disponibilité</h2>
        <div className="mt-3 flex flex-col gap-2">
          {disponibilites.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="date"
                value={d.debut}
                onChange={(e) => majDisponibilite(i, "debut", e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-500">au</span>
              <input
                type="date"
                value={d.fin}
                onChange={(e) => majDisponibilite(i, "fin", e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              {disponibilites.length > 1 && (
                <button
                  type="button"
                  onClick={() => supprimerDisponibilite(i)}
                  className="text-sm text-red-600"
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={ajouterDisponibilite}
            className="mt-1 w-fit text-sm underline"
          >
            + Ajouter une période
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">6. Caution</h2>
        <div className="mt-3 flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Prix neuf estimé (€)
              <input
                name="prixNeufEstime"
                type="number"
                min="0"
                step="0.01"
                required
                value={prixNeufEstime}
                onChange={(e) => {
                  setPrixNeufEstime(e.target.value);
                  setEstimeParIA(false);
                }}
                className="rounded-lg border px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={estimerViaIA}
              disabled={estimationEnCours}
              className="h-fit rounded-lg border px-3 py-2 text-sm"
            >
              {estimationEnCours ? "Estimation…" : "Estimer via IA"}
            </button>
          </div>
          {messageEstimation && <p className="text-sm text-gray-600">{messageEstimation}</p>}

          <label className="flex flex-col gap-1 text-sm">
            Âge du matériel
            <select
              name="ageMateriel"
              value={ageMateriel}
              onChange={(e) => setAgeMateriel(e.target.value as AgeMateriel)}
              className="rounded-lg border px-3 py-2"
            >
              {AGES_MATERIEL.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </label>

          {cautionCalculee != null && (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              Caution qui sera demandée au locataire : <strong>{cautionCalculee} €</strong>
            </p>
          )}

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="attestation" required className="mt-1" />
            J&apos;atteste sur l&apos;honneur que les informations transmises
            (prix, âge, état du matériel) sont exactes.
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Mode de remise</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="modesRemise" value="P2P" defaultChecked />
            Main à main (P2P)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="modesRemise" value="POINT_RELAIS" />
            Point relais (Haute-Marne)
          </label>
        </div>
      </section>

      <BoutonEnvoi texteEnCours="Publication en cours…" className="w-fit rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark">
        Publier l&apos;annonce
      </BoutonEnvoi>
    </form>
  );
}
