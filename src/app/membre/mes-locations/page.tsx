import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const metadata = { title: "Mes locations" };

export default async function MesLocationsPage() {
  const user = await getOrCreateUser();

  const bookings = user
    ? await prisma.booking.findMany({
        where: { locataireId: user.id },
        include: { listing: true, transaction: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mes locations</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-gray-600">Vous n&apos;avez pas encore de location.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded border p-4 text-sm">
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
                {booking.statut === "RESERVEE" ? (
                  <Link
                    href={`/reservation/${booking.id}/paiement`}
                    className="rounded bg-black px-3 py-1.5 text-white"
                  >
                    Finaliser le paiement
                  </Link>
                ) : (
                  <Link href={`/membre/reservations/${booking.id}`} className="text-sm underline">
                    Voir le détail
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
