import { prisma } from "@/lib/prisma";
import {
  enregistrerDepot,
  enregistrerRetrait,
  enregistrerRetour,
  validerRetourPointRelais,
} from "./actions";

export const metadata = { title: "Point relais" };

export default async function AdminPointRelaisPage() {
  const relais = await prisma.relayPoint.findFirst();

  const bookings = await prisma.booking.findMany({
    where: { modeRemise: "POINT_RELAIS", statut: { in: ["EN_COURS", "RETOURNEE"] } },
    include: { listing: true, locataire: true, proprietaire: true, relayStock: true },
    orderBy: { createdAt: "asc" },
  });

  const aDeposer = bookings.filter((b) => !b.relayStock);
  const deposes = bookings.filter((b) => b.relayStock?.statut === "DEPOSE");
  const retires = bookings.filter((b) => b.relayStock?.statut === "RETIRE");
  const retournes = bookings.filter((b) => b.relayStock?.statut === "RETOURNE" && b.statut === "RETOURNEE");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Point relais</h1>
        {relais ? (
          <p className="mt-1 text-sm text-gray-500">
            {relais.nom} — {relais.adresse}, {relais.codePostal} {relais.ville}
          </p>
        ) : (
          <p className="mt-1 text-sm text-red-600">
            Aucun point relais en base — lancez <code>npx prisma db seed</code>.
          </p>
        )}
      </div>

      <section>
        <h2 className="font-medium">À déposer par le propriétaire ({aDeposer.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {aDeposer.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>{b.listing.titre} · propriétaire : {b.proprietaire.email}</span>
              <form action={enregistrerDepot}>
                <input type="hidden" name="bookingId" value={b.id} />
                <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark">
                  Enregistrer le dépôt
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium">En stock, à remettre au locataire ({deposes.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {deposes.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>{b.listing.titre} · locataire : {b.locataire.email}</span>
              <form action={enregistrerRetrait}>
                <input type="hidden" name="bookingId" value={b.id} />
                <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark">
                  Enregistrer le retrait
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium">Chez le locataire, en attente de retour ({retires.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {retires.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>{b.listing.titre} · locataire : {b.locataire.email}</span>
              <form action={enregistrerRetour}>
                <input type="hidden" name="bookingId" value={b.id} />
                <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark">
                  Enregistrer le retour
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium">Retournés, à clôturer ({retournes.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {retournes.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>{b.listing.titre} · propriétaire : {b.proprietaire.email}</span>
              <form action={validerRetourPointRelais}>
                <input type="hidden" name="bookingId" value={b.id} />
                <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark">
                  Confirmer sans dommage & clôturer
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
