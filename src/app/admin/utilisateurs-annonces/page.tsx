import { prisma } from "@/lib/prisma";
import { approuverAnnonce, rejeterAnnonce, suspendreAnnonce } from "./actions";

export const metadata = { title: "Utilisateurs & annonces" };

export default async function AdminUtilisateursAnnoncesPage() {
  const [enAttente, enLigne, utilisateurs] = await Promise.all([
    prisma.listing.findMany({
      where: { statut: "EN_ATTENTE_MODERATION" },
      include: { category: true, proprietaire: { select: { nom: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listing.findMany({
      where: { statut: "EN_LIGNE" },
      include: { category: true, proprietaire: { select: { nom: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, email: true, nom: true, statut: true, estAdmin: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Modération des annonces</h1>
        <p className="mt-1 text-sm text-gray-500">
          Toute nouvelle annonce passe par cette file avant d&apos;être visible publiquement.
        </p>

        {enAttente.length === 0 ? (
          <p className="mt-4 text-gray-600">Aucune annonce en attente.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {enAttente.map((annonce) => (
              <li key={annonce.id} className="rounded border p-4 text-sm">
                <p className="font-medium">{annonce.titre}</p>
                <p className="mt-1 text-gray-500">
                  {annonce.category.nom} · {annonce.proprietaire.nom ?? annonce.proprietaire.email} ·{" "}
                  {annonce.ville ?? "Ville non renseignée"}
                </p>
                <p className="mt-1 text-gray-500 line-clamp-2">{annonce.description}</p>
                <div className="mt-3 flex gap-2">
                  <form action={approuverAnnonce}>
                    <input type="hidden" name="listingId" value={annonce.id} />
                    <button type="submit" className="rounded bg-black px-3 py-1.5 text-white">
                      Approuver
                    </button>
                  </form>
                  <form action={rejeterAnnonce}>
                    <input type="hidden" name="listingId" value={annonce.id} />
                    <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-red-700">
                      Rejeter
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Annonces en ligne ({enLigne.length})</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {enLigne.map((annonce) => (
            <li key={annonce.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>
                {annonce.titre} · {annonce.category.nom}
              </span>
              <form action={suspendreAnnonce}>
                <input type="hidden" name="listingId" value={annonce.id} />
                <button type="submit" className="text-red-700 underline">
                  Suspendre
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Utilisateurs récents</h2>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {utilisateurs.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span>
                {u.nom ?? u.email} · {u.statut}
                {u.estAdmin && " · admin"}
              </span>
              <span className="text-gray-500">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
