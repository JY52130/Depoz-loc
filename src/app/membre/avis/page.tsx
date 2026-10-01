import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const metadata = { title: "Avis" };

export default async function AvisPage() {
  const user = await getOrCreateUser();

  const [recus, donnes] = user
    ? await Promise.all([
        prisma.review.findMany({
          where: { cibleId: user.id },
          include: { auteur: { select: { nom: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.review.findMany({
          where: { auteurId: user.id },
          include: { cible: { select: { nom: true } } },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Avis</h1>
      {user?.noteMoyenne != null && (
        <p className="mt-1 text-sm text-gray-600">Votre note moyenne : {user.noteMoyenne}/5</p>
      )}

      <div className="mt-6">
        <h2 className="font-medium">Avis reçus</h2>
        {recus.length === 0 ? (
          <p className="mt-2 text-gray-600">Aucun avis reçu pour le moment.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {recus.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-3 shadow-sm text-sm">
                {r.auteur.nom ?? "Membre"} · {r.note}/5{r.commentaire ? ` — « ${r.commentaire} »` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-medium">Avis donnés</h2>
        {donnes.length === 0 ? (
          <p className="mt-2 text-gray-600">Vous n&apos;avez pas encore donné d&apos;avis.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {donnes.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-3 shadow-sm text-sm">
                {r.cible.nom ?? "Membre"} · {r.note}/5{r.commentaire ? ` — « ${r.commentaire} »` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
