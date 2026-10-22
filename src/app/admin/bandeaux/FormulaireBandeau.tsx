"use client";

// Formulaire d'ajout d'un bandeau : l'image est envoyée sur Supabase Storage
// (même espace que les photos d'annonces), puis le reste part à la server action.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import {
  EMPLACEMENTS_BANDEAU,
  HAUTEUR_IMAGE_BANDEAU,
  LARGEUR_IMAGE_BANDEAU,
  LONGUEUR_MAX_TEXTE_ALTERNATIF,
} from "@/lib/bandeaux";
import { ajouterBandeau } from "./actions";

const champ = "rounded-lg border px-3 py-2";

export function FormulaireBandeau() {
  const [imageUrl, setImageUrl] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurImage, setErreurImage] = useState<string | null>(null);

  async function envoyerImage(fichiers: FileList | null) {
    const fichier = fichiers?.[0];
    if (!fichier) return;
    setEnvoiEnCours(true);
    setErreurImage(null);
    try {
      const supabase = createClient();
      const chemin = `bandeaux/${crypto.randomUUID()}-${fichier.name}`;
      const { error } = await supabase.storage.from("annonces-photos").upload(chemin, fichier);
      if (error) throw error;
      setImageUrl(supabase.storage.from("annonces-photos").getPublicUrl(chemin).data.publicUrl);
    } catch {
      setErreurImage("L'image n'a pas pu être envoyée. Réessayez avec une image JPG ou PNG.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <form action={ajouterBandeau} className="flex flex-col gap-4 rounded-xl border bg-white p-5 text-sm shadow-sm">
      <p className="text-gray-600">Tous les champs sont obligatoires.</p>
      <label className="flex flex-col gap-1">
        Nom du commerçant
        <input name="annonceur" required className={champ} />
      </label>

      <label className="flex flex-col gap-1">
        Image du bandeau
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!imageUrl}
          aria-describedby="aide-image"
          onChange={(e) => envoyerImage(e.target.files)}
          className={champ}
        />
        <span id="aide-image" className="text-gray-600">
          Format large conseillé : {LARGEUR_IMAGE_BANDEAU} × {HAUTEUR_IMAGE_BANDEAU} pixels. Évitez les petits textes dans
          l&apos;image : ils deviennent illisibles sur téléphone.
        </span>
      </label>
      <p role="status" className="text-gray-700">
        {envoiEnCours ? "Envoi de l'image…" : imageUrl ? "Image envoyée." : ""}
      </p>
      {erreurImage && (
        <p role="alert" className="text-red-700">
          {erreurImage}
        </p>
      )}
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Aperçu du bandeau" className="w-full rounded-lg border" />
      )}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <label className="flex flex-col gap-1">
        Description de l&apos;image
        <textarea
          name="texteAlternatif"
          required
          maxLength={LONGUEUR_MAX_TEXTE_ALTERNATIF}
          rows={2}
          aria-describedby="aide-alt"
          className={champ}
        />
        <span id="aide-alt" className="text-gray-600">
          Recopiez le texte écrit sur l&apos;image. Il est lu aux personnes aveugles (obligatoire pour l&apos;accessibilité).
          Exemple : « Garage Martin, Saint-Dizier : -10 % sur la vidange en novembre ».
        </span>
      </label>

      <label className="flex flex-col gap-1">
        Site ou page Facebook du commerçant
        <input name="lien" type="url" required placeholder="https://…" className={champ} />
      </label>

      <label className="flex flex-col gap-1">
        Emplacement
        <select name="emplacement" required defaultValue="ACCUEIL" className={champ}>
          {Object.entries(EMPLACEMENTS_BANDEAU).map(([cle, e]) => (
            <option key={cle} value={cle}>
              {e.nom} ({e.prixSemaine} € la semaine, {e.prixMois} € le mois)
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          Premier jour
          <input name="debut" type="date" required className={champ} />
        </label>
        <label className="flex flex-col gap-1">
          Dernier jour
          <input name="fin" type="date" required className={champ} />
        </label>
      </div>

      <BoutonEnvoi
        texteEnCours="Enregistrement…"
        className="self-start rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Enregistrer le bandeau
      </BoutonEnvoi>
    </form>
  );
}
