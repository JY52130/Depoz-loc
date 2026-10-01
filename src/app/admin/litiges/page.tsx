import { prisma } from "@/lib/prisma";
import { resoudreLitigeAction } from "./actions";

export const metadata = { title: "Litiges" };

type Props = { searchParams: Promise<{ erreur?: string; resolu?: string }> };

export default async function AdminLitigesPage({ searchParams }: Props) {
  const params = await searchParams;

  const litiges = await prisma.dispute.findMany({
    include: {
      booking: { include: { listing: true, locataire: true, proprietaire: true } },
      ouvertPar: { select: { nom: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Litiges</h1>
      <p className="mt-1 text-sm text-gray-500">
        Traitement en interne (section 6.6). La caution retenue est débitée
        via la carte enregistrée (SetupIntent) puis reversée au propriétaire.
      </p>

      {params.erreur && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{params.erreur}</p>
      )}
      {params.resolu && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Litige résolu.</p>
      )}

      {litiges.length === 0 ? (
        <p className="mt-6 text-gray-600">Aucun litige.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {litiges.map((litige) => (
            <li key={litige.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-medium">{litige.booking.listing.titre}</p>
              <p className="mt-1 text-sm text-gray-600">
                Ouvert par {litige.ouvertPar.nom ?? litige.ouvertPar.email} · Statut : {litige.statut}
              </p>
              <p className="mt-1 text-sm text-gray-600">Motif : {litige.motif}</p>
              <p className="mt-1 text-sm text-gray-500">
                Locataire : {litige.booking.locataire.email} · Propriétaire : {litige.booking.proprietaire.email}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Caution disponible : {litige.booking.montantCaution.toString()} €
              </p>

              {litige.statut === "OUVERT" ? (
                <form action={resoudreLitigeAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="bookingId" value={litige.bookingId} />
                  <label className="flex flex-col gap-1 text-sm">
                    Montant de caution à retenir (€)
                    <input
                      type="number"
                      name="montantCautionRetenu"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      max={Number(litige.booking.montantCaution)}
                      className="rounded-lg border px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1 text-sm">
                    Décision
                    <input name="decision" required className="rounded-lg border px-3 py-2" />
                  </label>
                  <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
                    Résoudre
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-gray-700">
                  Décision : {litige.decision} · Caution retenue :{" "}
                  {litige.montantCautionRetenu?.toString() ?? "0"} €
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
