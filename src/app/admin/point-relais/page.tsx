import { prisma } from "@/lib/prisma";
import { libellePeriode } from "@/lib/periodeLocation";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";
import { ajouterCommercantRelais, changerActivationRelais } from "./actions";

export const metadata = { title: "Commerçants relais" };

type Props = { searchParams: Promise<{ ok?: string; erreur?: string }> };

const champ = "rounded-lg border px-3 py-2";

export default async function AdminPointRelaisPage({ searchParams }: Props) {
  const params = await searchParams;
  const relais = await prisma.relayPoint.findMany({
    orderBy: [{ actif: "desc" }, { ville: "asc" }, { nom: "asc" }],
    include: {
      bookings: {
        where: { statut: { in: ["RESERVEE", "EN_COURS", "RETOURNEE"] } },
        include: { listing: { select: { titre: true } } },
        orderBy: { dateDebut: "asc" },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Commerçants relais</h1>
        <p className="mt-1 text-sm text-gray-600">
          Le propriétaire dépose l&apos;objet chez le commerçant, le locataire l&apos;y retire puis l&apos;y rapporte.
          Le locataire paie {FRAIS_POINT_RELAIS} € par location à Dépôt Malin ; la part du commerçant se règle selon
          votre accord avec lui.
        </p>
      </div>

      {params.ok && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {params.ok}
        </p>
      )}
      {params.erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <section aria-labelledby="titre-liste">
        <h2 id="titre-liste" className="font-medium">
          Liste ({relais.filter((r) => r.actif).length} proposé(s) aux locataires)
        </h2>
        {relais.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Aucun commerçant relais pour le moment.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {relais.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {r.nom}
                      {!r.actif && <span className="ml-2 text-gray-600">(retiré de la liste)</span>}
                    </p>
                    <p className="text-gray-700">
                      {r.adresse}, {r.codePostal} {r.ville}
                      {r.telephone && ` · ${r.telephone}`}
                    </p>
                    {r.horaires && <p className="text-gray-600">{r.horaires}</p>}
                  </div>
                  <form action={changerActivationRelais}>
                    <input type="hidden" name="relayPointId" value={r.id} />
                    <input type="hidden" name="actif" value={r.actif ? "false" : "true"} />
                    <button
                      type="submit"
                      className="rounded-lg border border-brand px-3 py-1.5 font-medium text-brand-dark hover:bg-brand-50"
                    >
                      {r.actif ? "Retirer de la liste" : "Proposer de nouveau"}
                      <span className="sr-only"> : {r.nom}</span>
                    </button>
                  </form>
                </div>
                {r.bookings.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <h3 className="font-medium">Locations en cours chez ce commerçant</h3>
                    <ul className="mt-1 list-disc pl-5 text-gray-700">
                      {r.bookings.map((b) => (
                        <li key={b.id}>
                          {b.listing.titre} ·{" "}
                          {libellePeriode(b.dateDebut, b.dateFin, { day: "numeric", month: "numeric", year: "numeric" })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-ajout" className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 id="titre-ajout" className="font-medium">Ajouter un commerçant relais</h2>
        <p className="mt-1 text-sm text-gray-600">Les champs marqués d&apos;un astérisque (*) sont obligatoires.</p>
        <form action={ajouterCommercantRelais} className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            Nom du commerce *
            <input name="nom" required autoComplete="organization" className={champ} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            Adresse *
            <input name="adresse" required autoComplete="street-address" className={champ} />
          </label>
          <label className="flex flex-col gap-1">
            Code postal *
            <input
              name="codePostal"
              required
              inputMode="numeric"
              pattern="[0-9]{5}"
              autoComplete="postal-code"
              className={champ}
            />
          </label>
          <label className="flex flex-col gap-1">
            Ville *
            <input name="ville" required autoComplete="address-level2" className={champ} />
          </label>
          <label className="flex flex-col gap-1">
            Téléphone
            <input name="telephone" type="tel" autoComplete="tel" className={champ} />
          </label>
          <label className="flex flex-col gap-1">
            Horaires
            <input name="horaires" placeholder="Ex. : du mardi au samedi, 9 h – 19 h" className={champ} />
          </label>
          <BoutonEnvoi
            texteEnCours="Ajout…"
            className="w-fit rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Ajouter
          </BoutonEnvoi>
        </form>
      </section>
    </div>
  );
}
