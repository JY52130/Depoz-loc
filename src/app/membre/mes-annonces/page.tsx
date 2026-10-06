import Link from "next/link";
import { Malin } from "@/components/Malin";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import {
  JOURS_GRATUITS,
  JOURS_PROLONGATION,
  PRIX_PROLONGATION,
  STATUTS_LOCATION_PAYEE,
  estExpiree,
  expireBientot,
} from "@/lib/dureeAnnonce";
import { JOURS_MISE_EN_AVANT, estMiseEnAvant, prixMiseEnAvant } from "@/lib/miseEnAvant";
import {
  estProActif,
  miseEnAvantOfferteDisponible,
  prochaineMiseEnAvantOfferte,
} from "@/lib/abonnementPro";
import { ChampsModesRemise } from "@/components/ChampsModesRemise";
import { IdeesObjets } from "@/components/IdeesObjets";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { mettreEnAvant, mettreEnAvantOffert, modifierModesRemise, prolongerAnnonce } from "./actions";

export const metadata = { title: "Mes annonces" };

type Props = {
  searchParams: Promise<{ creee?: string; prolongee?: string; enavant?: string; remise?: string; erreur?: string }>;
};

function dateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

const LIBELLES_STATUT: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_ATTENTE_MODERATION: "En attente de validation",
  EN_LIGNE: "En ligne",
  SUSPENDU: "Refusée ou suspendue",
};

export default async function MesAnnoncesPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getOrCreateUser();
  const relaisDisponibles = (await prisma.relayPoint.count({ where: { actif: true } })) > 0;

  const annonces = user
    ? await prisma.listing.findMany({
        where: { proprietaireId: user.id },
        include: {
          category: true,
          _count: { select: { bookings: { where: { statut: { in: STATUTS_LOCATION_PAYEE } } } } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const proActif = estProActif(user);
  const offerteDisponible = proActif && miseEnAvantOfferteDisponible(user?.derniereMiseEnAvantOfferte);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes annonces</h1>
        <Link
          href="/membre/mes-annonces/nouvelle"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {params.creee && (
        <div role="status" className="mt-4 flex items-center gap-4 rounded-2xl bg-green-50 px-4 py-3 text-green-800">
          <Malin pose="validation" classeTaille="h-24" className="shrink-0" />
          <p>
            <strong>Bravo, votre annonce est créée !</strong> Elle sera visible publiquement après validation par
            notre équipe (modération).
          </p>
        </div>
      )}

      {(params.creee || annonces.length < 5) && <IdeesObjets ouvert={Boolean(params.creee)} />}

      {params.prolongee && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {params.prolongee === "gratuite"
            ? `Annonce prolongée gratuitement de ${JOURS_PROLONGATION} jours, car votre objet a déjà été loué.`
            : `Merci ! Votre paiement est reçu : l'annonce est prolongée de ${JOURS_PROLONGATION} jours (la date se met à jour dans quelques instants).`}
        </p>
      )}

      {params.enavant && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {params.enavant === "offert"
            ? `C'est fait : votre annonce est « À la une » pendant ${JOURS_MISE_EN_AVANT} jours, offert avec votre abonnement Pro.`
            : `Merci ! Votre paiement est reçu : votre annonce est « À la une » pendant ${JOURS_MISE_EN_AVANT} jours (cela s'affiche dans quelques instants).`}
        </p>
      )}

      {params.remise && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          C&apos;est enregistré : les modes de remise de votre annonce sont à jour.
        </p>
      )}

      {params.erreur && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      {proActif ? (
        <p className="mt-4 text-sm text-gray-600">
          Membre Pro : vos annonces restent en ligne sans limite de durée.{" "}
          {offerteDisponible
            ? "Vous avez une mise « À la une » offerte à utiliser."
            : user?.derniereMiseEnAvantOfferte &&
              `Prochaine mise « À la une » offerte à partir du ${dateCourte(prochaineMiseEnAvantOfferte(user.derniereMiseEnAvantOfferte))}.`}
        </p>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          Chaque annonce est en ligne gratuitement {JOURS_GRATUITS} jours après sa validation. Ensuite, vous pouvez la
          prolonger de {JOURS_PROLONGATION} jours pour {PRIX_PROLONGATION} €, ou gratuitement si votre objet a déjà été
          loué.{" "}
          <Link href="/membre/abonnement-pro" className="text-brand-dark underline">
            Professionnel ? Découvrez l&apos;abonnement Pro.
          </Link>
        </p>
      )}

      {annonces.length === 0 ? (
        <p className="mt-6 text-gray-600">Vous n&apos;avez pas encore d&apos;annonce.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {annonces.map((annonce) => (
            <li key={annonce.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{annonce.titre}</p>
                  <p className="text-sm text-gray-500">
                    {annonce.category.nom} · {annonce.ville ?? "Ville non renseignée"} ·{" "}
                    {LIBELLES_STATUT[annonce.statut]}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Caution : {annonce.montantCaution?.toString()} €
                </p>
              </div>
              {annonce.statut === "EN_LIGNE" && annonce.enLigneJusquau && (
                <DureeEnLigne
                  listingId={annonce.id}
                  enLigneJusquau={annonce.enLigneJusquau}
                  dejaLouee={annonce._count.bookings > 0}
                />
              )}
              {annonce.statut === "EN_LIGNE" && !estExpiree(annonce.enLigneJusquau) && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                  <p className="text-gray-600">
                    {estMiseEnAvant(annonce.misEnAvantJusquau)
                      ? `★ À la une jusqu'au ${dateCourte(annonce.misEnAvantJusquau!)}.`
                      : "Passez en tête des résultats avec le badge « À la une »."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {offerteDisponible && (
                      <form action={mettreEnAvantOffert}>
                        <input type="hidden" name="listingId" value={annonce.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark"
                        >
                          À la une {JOURS_MISE_EN_AVANT} jours (offert Pro)
                        </button>
                      </form>
                    )}
                    <form action={mettreEnAvant}>
                      <input type="hidden" name="listingId" value={annonce.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-accent px-3 py-1.5 font-medium text-ink transition hover:brightness-105"
                      >
                        {estMiseEnAvant(annonce.misEnAvantJusquau) ? "Ajouter" : "Mettre à la une"} {JOURS_MISE_EN_AVANT}{" "}
                        jours ({prixMiseEnAvant(annonce)} €)
                      </button>
                    </form>
                  </div>
                </div>
              )}
              <details className="mt-3 border-t pt-3 text-sm">
                <summary className="cursor-pointer font-medium text-brand-dark">
                  Remise de l&apos;objet : main à main, commerçant relais, livraison
                  <span className="sr-only"> ({annonce.titre})</span>
                </summary>
                <form action={modifierModesRemise} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="listingId" value={annonce.id} />
                  <ChampsModesRemise
                    idPrefixe={`annonce-${annonce.id}`}
                    modesRemise={annonce.modesRemise}
                    prixLivraison={annonce.prixLivraison != null ? Number(annonce.prixLivraison) : null}
                    distanceLivraisonKm={annonce.distanceLivraisonKm}
                    relaisDisponibles={relaisDisponibles}
                  />
                  <BoutonEnvoi
                    texteEnCours="Enregistrement…"
                    className="w-fit rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark"
                  >
                    Enregistrer
                  </BoutonEnvoi>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DureeEnLigne({
  listingId,
  enLigneJusquau,
  dejaLouee,
}: {
  listingId: string;
  enLigneJusquau: Date;
  dejaLouee: boolean;
}) {
  const expiree = estExpiree(enLigneJusquau);
  const bientot = expireBientot(enLigneJusquau);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
      <p className={expiree ? "font-medium text-red-700" : bientot ? "font-medium text-amber-800" : "text-gray-600"}>
        {expiree
          ? `Expirée depuis le ${dateCourte(enLigneJusquau)} : elle n'est plus visible.`
          : `En ligne jusqu'au ${dateCourte(enLigneJusquau)}.`}
      </p>
      <form action={prolongerAnnonce}>
        <input type="hidden" name="listingId" value={listingId} />
        <button
          type="submit"
          className="rounded-lg border border-brand px-3 py-1.5 font-medium text-brand transition-colors hover:bg-brand-50"
        >
          {dejaLouee
            ? `Prolonger de ${JOURS_PROLONGATION} jours (gratuit)`
            : `Prolonger de ${JOURS_PROLONGATION} jours (${PRIX_PROLONGATION} €)`}
        </button>
      </form>
    </div>
  );
}
