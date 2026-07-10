import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const metadata = { title: "Mes annonces" };

type Props = { searchParams: Promise<{ creee?: string }> };

export default async function MesAnnoncesPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getOrCreateUser();

  const annonces = user
    ? await prisma.listing.findMany({
        where: { proprietaireId: user.id },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes annonces</h1>
        <Link
          href="/membre/mes-annonces/nouvelle"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {params.creee && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Annonce créée avec succès — elle sera visible publiquement après
          validation par notre équipe (modération).
        </p>
      )}

      {annonces.length === 0 ? (
        <p className="mt-6 text-gray-600">Vous n&apos;avez pas encore d&apos;annonce.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {annonces.map((annonce) => (
            <li key={annonce.id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{annonce.titre}</p>
                  <p className="text-sm text-gray-500">
                    {annonce.category.nom} · {annonce.ville ?? "Ville non renseignée"} ·{" "}
                    {annonce.statut}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Caution : {annonce.montantCaution?.toString()} €
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
