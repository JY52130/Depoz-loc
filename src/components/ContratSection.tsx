import Link from "next/link";
import { accepterContrat } from "@/app/membre/reservations/[bookingId]/actions";

type BookingLite = {
  id: string;
  statut: string;
  contratAccepteLocataireLe: Date | null;
  contratAccepteProprietaireLe: Date | null;
};

export function ContratSection({ booking, role }: { booking: BookingLite; role: "locataire" | "proprietaire" }) {
  const accepteParMoi =
    role === "proprietaire" ? booking.contratAccepteProprietaireLe : booking.contratAccepteLocataireLe;
  const accepteParLAutre =
    role === "proprietaire" ? booking.contratAccepteLocataireLe : booking.contratAccepteProprietaireLe;
  const autre = role === "proprietaire" ? "le locataire" : "le propriétaire";

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">Contrat de location</h2>

      {accepteParMoi && accepteParLAutre ? (
        <p className="mt-1 text-sm text-gray-600">
          Le contrat a été accepté par les deux parties. La remise de l&apos;objet peut avoir lieu.
        </p>
      ) : accepteParMoi ? (
        <p className="mt-1 text-sm text-gray-600">
          Vous avez accepté le contrat. En attente de l&apos;acceptation par {autre}.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-600">
            Lisez le contrat rempli avec les informations de cette réservation, puis
            acceptez-le. Il doit être accepté par les deux parties avant la remise de
            l&apos;objet.
          </p>
          {booking.statut !== "ANNULEE" && (
            <form action={accepterContrat} className="mt-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                J&apos;accepte le contrat de location
              </button>
            </form>
          )}
        </>
      )}

      <p className="mt-3 text-sm">
        <Link href={`/membre/reservations/${booking.id}/contrat`} className="text-brand underline">
          Lire le contrat de location
        </Link>
      </p>
    </section>
  );
}
