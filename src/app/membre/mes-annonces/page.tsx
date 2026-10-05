import Link from "next/link";
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
import { prolongerAnnonce } from "./actions";

export const metadata = { title: "Mes annonces" };

type Props = { searchParams: Promise<{ creee?: string; prolongee?: string; erreur?: string }> };

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
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Annonce créée avec succès — elle sera visible publiquement après
          validation par notre équipe (modération).
        </p>
      )}

      {params.prolongee && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {params.prolongee === "gratuite"
            ? `Annonce prolongée gratuitement de ${JOURS_PROLONGATION} jours, car votre objet a déjà été loué.`
            : `Merci ! Votre paiement est reçu : l'annonce est prolongée de ${JOURS_PROLONGATION} jours (la date se met à jour dans quelques instants).`}
        </p>
      )}

      {params.erreur && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Chaque annonce est en ligne gratuitement {JOURS_GRATUITS} jours après sa validation. Ensuite, vous pouvez la
        prolonger de {JOURS_PROLONGATION} jours pour {PRIX_PROLONGATION} €, ou gratuitement si votre objet a déjà été
        loué.
      </p>

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
