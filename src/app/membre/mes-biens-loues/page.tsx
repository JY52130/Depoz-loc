import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const metadata = { title: "Mes biens loués" };

export default async function MesBiensLouesPage() {
  const user = await getOrCreateUser();

  const bookings = user
    ? await prisma.booking.findMany({
        where: { proprietaireId: user.id },
        include: { listing: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mes biens loués</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-gray-600">Aucune demande de location pour le moment.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded-xl border bg-white p-4 shadow-sm text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/membre/reservations/${booking.id}`} className="font-medium hover:underline">
                    {booking.listing.titre}
                  </Link>
                  <p className="text-gray-500">
                    {new Date(booking.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(booking.dateFin).toLocaleDateString("fr-FR")} · {booking.statut}
                  </p>
                </div>
                <Link href={`/membre/reservations/${booking.id}`} className="text-sm underline">
                  Voir le détail
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
