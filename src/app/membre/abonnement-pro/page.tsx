import { getOrCreateUser } from "@/lib/getOrCreateUser";
import {
  JOURS_ENTRE_MISES_EN_AVANT_OFFERTES,
  PRIX_ABONNEMENT_PRO,
  TAUX_COMMISSION_PRO,
  estProActif,
} from "@/lib/abonnementPro";
import { TAUX_COMMISSION_PROPRIETAIRE } from "@/lib/constantesReservation";
import { JOURS_GRATUITS } from "@/lib/dureeAnnonce";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { reprendreAbonnementPro, resilierAbonnementPro, souscrireAbonnementPro } from "./actions";

export const metadata = { title: "Abonnement Pro" };

type Props = { searchParams: Promise<{ pro?: string; erreur?: string }> };

const prix = PRIX_ABONNEMENT_PRO.toLocaleString("fr-FR", { minimumFractionDigits: 2 });
const pourcent = (taux: number) => `${Math.round(taux * 100)} %`;

function dateLongue(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

const MESSAGES: Record<string, string> = {
  bienvenue:
    "Merci ! Votre paiement est reçu : votre abonnement Pro s'active dans quelques instants (rechargez la page si besoin).",
  resilie: "C'est noté : votre abonnement s'arrêtera à la fin du mois déjà payé. Rien ne sera plus prélevé.",
  repris: "C'est noté : votre abonnement Pro continue.",
};

const champ = "rounded-lg border px-3 py-2";

export default async function AbonnementProPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getOrCreateUser();
  const actif = estProActif(user);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Abonnement Pro</h1>

      {params.pro && MESSAGES[params.pro] && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {MESSAGES[params.pro]}
        </p>
      )}
      {params.erreur && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <section aria-labelledby="titre-avantages" className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 id="titre-avantages" className="text-lg font-semibold">
          Pour les professionnels : {prix} € par mois
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Vos annonces restent en ligne sans limite de durée (au lieu de {JOURS_GRATUITS} jours).</li>
          <li>
            Commission réduite sur vos locations : {pourcent(TAUX_COMMISSION_PRO)} au lieu de{" "}
            {pourcent(TAUX_COMMISSION_PROPRIETAIRE)}.
          </li>
          <li>Badge « Pro » avec le nom de votre entreprise sur vos annonces.</li>
          <li>Une mise « À la une » offerte tous les {JOURS_ENTRE_MISES_EN_AVANT_OFFERTES} jours.</li>
          <li>Le badge « Identité vérifiée » offert.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">Sans engagement : vous pouvez résilier à tout moment.</p>
      </section>

      {!user ? null : actif ? (
        <section aria-labelledby="titre-mon-abonnement" className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 id="titre-mon-abonnement" className="text-lg font-semibold">
            Mon abonnement
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            <strong>{user.nomEntreprise ?? "Votre entreprise"}</strong> · SIRET {user.siret}
          </p>
          <p className="mt-1 text-sm text-gray-700">
            {user.proResiliationPrevue
              ? `Résiliation demandée : vos avantages Pro s'arrêtent le ${dateLongue(user.proActifJusquau!)}.`
              : `Abonnement actif. Prochain paiement de ${prix} € le ${dateLongue(user.proActifJusquau!)}.`}
          </p>
          {user.stripeSubscriptionId && (
            <form action={user.proResiliationPrevue ? reprendreAbonnementPro : resilierAbonnementPro} className="mt-4">
              <BoutonEnvoi
                texteEnCours="Un instant…"
                className={
                  user.proResiliationPrevue
                    ? "rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                    : "rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                }
              >
                {user.proResiliationPrevue ? "Garder mon abonnement" : "Résilier mon abonnement"}
              </BoutonEnvoi>
            </form>
          )}
        </section>
      ) : (
        <section aria-labelledby="titre-souscrire" className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 id="titre-souscrire" className="text-lg font-semibold">
            Devenir Pro
          </h2>
          <p className="mt-1 text-sm text-gray-600">Les champs marqués d&apos;un astérisque (*) sont obligatoires.</p>
          <form action={souscrireAbonnementPro} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Nom de l&apos;entreprise *
              <input
                name="nomEntreprise"
                required
                autoComplete="organization"
                defaultValue={user.nomEntreprise ?? ""}
                className={champ}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Numéro SIRET (14 chiffres) *
              <input
                name="siret"
                required
                inputMode="numeric"
                pattern="[0-9 ]{14,20}"
                aria-describedby="aide-siret"
                defaultValue={user.siret ?? ""}
                className={champ}
              />
              <span id="aide-siret" className="text-gray-600">
                Exemple : 123 456 789 00012. Il figure sur votre extrait Kbis ou sur annuaire-entreprises.data.gouv.fr.
              </span>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Numéro de TVA intracommunautaire (facultatif)
              <input name="numeroTva" defaultValue={user.numeroTva ?? ""} className={champ} />
            </label>
            <BoutonEnvoi
              texteEnCours="Redirection vers le paiement…"
              className="self-start rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              S&apos;abonner pour {prix} € par mois
            </BoutonEnvoi>
            <p className="text-sm text-gray-600">
              Le paiement se fait de façon sécurisée par Stripe, puis chaque mois automatiquement.
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
