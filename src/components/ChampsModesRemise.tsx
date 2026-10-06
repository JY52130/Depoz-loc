import {
  COMMISSION_LIVRAISON_MINIMUM,
  DISTANCE_LIVRAISON_MAX_KM,
  PRIX_LIVRAISON_MAX,
  TAUX_COMMISSION_LIVRAISON,
} from "@/lib/livraison";

type Props = {
  /** Préfixe des identifiants (plusieurs formulaires sur la même page). */
  idPrefixe: string;
  modesRemise?: string[];
  prixLivraison?: number | null;
  distanceLivraisonKm?: number | null;
  /** Faux tant qu'aucun commerçant relais n'est proposé : la case est masquée. */
  relaisDisponibles: boolean;
};

const champ = "w-28 rounded-lg border px-3 py-2";

// Cases « mode de remise » d'une annonce : main à main, commerçant relais,
// livraison par le propriétaire (avec son prix et sa distance maximale).
export function ChampsModesRemise({
  idPrefixe,
  modesRemise = ["P2P"],
  prixLivraison,
  distanceLivraisonKm,
  relaisDisponibles,
}: Props) {
  const aide = `${idPrefixe}-aide-livraison`;
  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="sr-only">Modes de remise proposés</legend>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="modesRemise" value="P2P" defaultChecked={modesRemise.includes("P2P")} />
        Main à main : le locataire vient chercher l&apos;objet
      </label>
      {(relaisDisponibles || modesRemise.includes("POINT_RELAIS")) && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="modesRemise"
            value="POINT_RELAIS"
            defaultChecked={modesRemise.includes("POINT_RELAIS")}
          />
          Commerçant relais : vous déposez l&apos;objet chez un commerçant partenaire
        </label>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="modesRemise"
          value="LIVRAISON"
          defaultChecked={modesRemise.includes("LIVRAISON")}
          aria-describedby={aide}
        />
        Livraison : j&apos;apporte l&apos;objet et je viens le rechercher
      </label>
      <div className="ml-6 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          Prix aller-retour (€)
          <input
            name="prixLivraison"
            type="number"
            min="0.01"
            max={PRIX_LIVRAISON_MAX}
            step="0.01"
            inputMode="decimal"
            defaultValue={prixLivraison ?? ""}
            className={champ}
          />
        </label>
        <label className="flex flex-col gap-1">
          Jusqu&apos;à (km)
          <input
            name="distanceLivraisonKm"
            type="number"
            min="1"
            max={DISTANCE_LIVRAISON_MAX_KM}
            step="1"
            inputMode="numeric"
            defaultValue={distanceLivraisonKm ?? ""}
            className={champ}
          />
        </label>
      </div>
      <p id={aide} className="ml-6 text-gray-600">
        À remplir si vous livrez. Le locataire paie la livraison avec la location ; Dépôt Malin garde{" "}
        {TAUX_COMMISSION_LIVRAISON * 100} % ({COMMISSION_LIVRAISON_MINIMUM.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € minimum)
        et vous reverse le reste avec la location.
      </p>
    </fieldset>
  );
}
