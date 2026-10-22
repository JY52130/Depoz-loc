import { prisma } from "@/lib/prisma";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { EMPLACEMENTS_BANDEAU, bandeauEnCours } from "@/lib/bandeaux";
import { FormulaireBandeau } from "./FormulaireBandeau";
import { arreterBandeau } from "./actions";

export const metadata = { title: "Bandeaux publicitaires" };

type Props = { searchParams: Promise<{ ok?: string; erreur?: string }> };

const dateCourte = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

export default async function AdminBandeauxPage({ searchParams }: Props) {
  const params = await searchParams;
  const bandeaux = await prisma.bandeau.findMany({ orderBy: { debut: "desc" }, take: 100 });
  const maintenant = new Date();
  const enCours = bandeaux.filter((b) => bandeauEnCours(b, maintenant));
  const aVenir = bandeaux.filter((b) => b.actif && b.debut > maintenant);
  const termines = bandeaux.filter((b) => !enCours.includes(b) && !aVenir.includes(b));

  const liste = (titre: string, id: string, items: typeof bandeaux, arretable: boolean) => (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-medium">
        {titre} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">Aucun.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {items.map((b) => (
            <li key={b.id} className="rounded-xl border bg-white p-4 text-sm shadow-sm">
              <p className="font-medium">{b.annonceur}</p>
              <p className="text-gray-700">
                {EMPLACEMENTS_BANDEAU[b.emplacement].nom} · du {dateCourte(b.debut)} au {dateCourte(b.fin)}
                {!b.actif && " · arrêté"}
              </p>
              <p className="text-gray-700">
                {b.vues} vue{b.vues > 1 ? "s" : ""} · {b.clics} clic{b.clics > 1 ? "s" : ""}
              </p>
              {arretable && (
                <form action={arreterBandeau} className="mt-2">
                  <input type="hidden" name="bandeauId" value={b.id} />
                  <BoutonEnvoi
                    texteEnCours="Un instant…"
                    className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                  >
                    Arrêter
                    <span className="sr-only"> le bandeau de {b.annonceur}</span>
                  </BoutonEnvoi>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Bandeaux publicitaires</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quand un commerçant a payé (lien de paiement Stripe), ajoutez son bandeau ici : il s&apos;affiche tout seul
          entre le premier et le dernier jour, avec la mention « Publicité ». Sans bandeau, le site affiche une annonce
          de Dépôt Malin. Les pages peuvent mettre jusqu&apos;à une heure à se mettre à jour.
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

      {liste("En ligne", "titre-en-cours", enCours, true)}
      {liste("À venir", "titre-a-venir", aVenir, true)}

      <section aria-labelledby="titre-ajouter">
        <h2 id="titre-ajouter" className="mb-2 font-medium">
          Ajouter un bandeau
        </h2>
        <FormulaireBandeau />
      </section>

      {liste("Terminés ou arrêtés", "titre-termines", termines, false)}
    </div>
  );
}
