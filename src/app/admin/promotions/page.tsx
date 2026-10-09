import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { FORMULES_PROMOTION } from "@/lib/promotionReseaux";
import { marquerPromotionPubliee } from "./actions";

export const metadata = { title: "Promotions réseaux sociaux" };

type Props = { searchParams: Promise<{ ok?: string; erreur?: string }> };

const dateCourte = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });

export default async function AdminPromotionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const promotions = await prisma.promotionReseaux.findMany({
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      listing: { select: { titre: true, slug: true, ville: true } },
      user: { select: { email: true } },
    },
  });
  const aFaire = promotions.filter((p) => p.statut === "A_FAIRE");
  const publiees = promotions.filter((p) => p.statut === "PUBLIEE");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Promotions réseaux sociaux</h1>
        <p className="mt-1 text-sm text-gray-600">
          Publiez l&apos;annonce sur les pages Facebook et Instagram de Dépôt Malin (et lancez la publicité pour la
          formule « {FORMULES_PROMOTION.PUBLICITE.nom} », ciblée autour de la ville de l&apos;objet), puis collez le
          lien de la publication : le propriétaire est prévenu par e-mail.
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

      <section aria-labelledby="titre-a-faire">
        <h2 id="titre-a-faire" className="font-medium">
          À publier ({aFaire.length})
        </h2>
        {aFaire.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Aucune promotion en attente.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {aFaire.map((p) => (
              <li key={p.id} className="rounded-xl border bg-white p-4 text-sm shadow-sm">
                <p className="font-medium">
                  <Link href={`/annonce/${p.listing.slug}`} className="text-brand-dark underline">
                    {p.listing.titre}
                  </Link>
                </p>
                <p className="text-gray-700">
                  {FORMULES_PROMOTION[p.formule].nom} · {p.montant.toString()} € · payée le {dateCourte(p.createdAt)}
                  {p.listing.ville && ` · ${p.listing.ville}`} · {p.user.email}
                </p>
                <form action={marquerPromotionPubliee} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="promotionId" value={p.id} />
                  <label className="flex min-w-0 flex-1 flex-col gap-1">
                    Lien de la publication
                    <input
                      name="lienPublication"
                      type="url"
                      required
                      placeholder="https://www.facebook.com/…"
                      className="rounded-lg border px-3 py-2"
                    />
                  </label>
                  <BoutonEnvoi
                    texteEnCours="Enregistrement…"
                    className="rounded-lg bg-brand px-3 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
                  >
                    Marquer comme publiée
                    <span className="sr-only"> : {p.listing.titre}</span>
                  </BoutonEnvoi>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-publiees">
        <h2 id="titre-publiees" className="font-medium">
          Déjà publiées ({publiees.length})
        </h2>
        {publiees.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Aucune pour le moment.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {publiees.map((p) => (
              <li key={p.id} className="rounded-xl border bg-white px-4 py-3">
                {p.listing.titre} · {FORMULES_PROMOTION[p.formule].nom}
                {p.publieeLe && ` · publiée le ${dateCourte(p.publieeLe)}`}
                {p.lienPublication && (
                  <>
                    {" · "}
                    <a href={p.lienPublication} className="text-brand-dark underline" target="_blank" rel="noopener noreferrer">
                      voir la publication<span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
