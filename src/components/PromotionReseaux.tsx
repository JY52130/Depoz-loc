import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { FORMULES_PROMOTION, prixFormule, type CleFormule } from "@/lib/promotionReseaux";
import { promouvoirSurReseaux } from "@/app/membre/mes-annonces/actions";

type Promotion = {
  id: string;
  formule: CleFormule;
  statut: "A_FAIRE" | "PUBLIEE";
  lienPublication: string | null;
};

const FORMULES = Object.keys(FORMULES_PROMOTION) as CleFormule[];

// Bloc « Promouvoir sur les réseaux sociaux » d'une annonce dans Mes annonces
// (voir src/lib/promotionReseaux.ts) : suivi des promotions déjà payées et
// choix d'une formule.
export function PromotionReseaux({
  listingId,
  titreAnnonce,
  promotions,
  peutCommander,
}: {
  listingId: string;
  titreAnnonce: string;
  promotions: Promotion[];
  peutCommander: boolean;
}) {
  const idPrefixe = `promo-${listingId}`;
  return (
    <details className="mt-3 border-t pt-3 text-sm">
      <summary className="cursor-pointer font-medium text-brand-dark">
        Promouvoir sur les réseaux sociaux (Facebook, Instagram)
        <span className="sr-only"> ({titreAnnonce})</span>
      </summary>

      {promotions.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-gray-700">
          {promotions.map((p) => (
            <li key={p.id}>
              {FORMULES_PROMOTION[p.formule].nom} :{" "}
              {p.statut === "PUBLIEE" && p.lienPublication ? (
                <a
                  href={p.lienPublication}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-dark underline"
                >
                  publiée, voir la publication<span className="sr-only"> (nouvel onglet)</span>
                </a>
              ) : (
                "payée, publication en préparation par notre équipe."
              )}
            </li>
          ))}
        </ul>
      )}

      {peutCommander && (
        <form action={promouvoirSurReseaux} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="listingId" value={listingId} />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-gray-700">Choisissez une formule :</legend>
            {FORMULES.map((cle, index) => (
              <label key={cle} htmlFor={`${idPrefixe}-${cle}`} className="flex items-start gap-2 rounded-lg border bg-white p-3">
                <input
                  id={`${idPrefixe}-${cle}`}
                  type="radio"
                  name="formule"
                  value={cle}
                  defaultChecked={index === 0}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">
                    {FORMULES_PROMOTION[cle].nom} : {prixFormule(cle)}
                  </span>
                  <span className="block text-gray-600">{FORMULES_PROMOTION[cle].description}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <BoutonEnvoi
            texteEnCours="Redirection vers le paiement…"
            className="w-fit rounded-lg bg-accent px-3 py-1.5 font-medium text-ink transition hover:brightness-105"
          >
            Payer et promouvoir
          </BoutonEnvoi>
        </form>
      )}
    </details>
  );
}
