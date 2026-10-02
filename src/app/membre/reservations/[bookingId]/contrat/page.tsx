import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { ContratLocation } from "@/components/ContratLocation";
import { BoutonImprimer } from "@/components/BoutonImprimer";

export const metadata = { title: "Contrat de location" };

type Props = { params: Promise<{ bookingId: string }> };

export default async function ContratReservationPage({ params }: Props) {
  const { bookingId } = await params;
  const user = await getOrCreateUser();
  if (!user) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: true,
      locataire: { select: { nom: true, email: true } },
      proprietaire: { select: { nom: true, email: true } },
    },
  });

  if (!booking || (booking.locataireId !== user.id && booking.proprietaireId !== user.id)) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Contrat de location</h1>
          <p className="mt-1 text-sm text-gray-600">Réservation n° {booking.id}</p>
        </div>
        <BoutonImprimer />
      </div>

      <ContratLocation
        donnees={{
          proprietaire: booking.proprietaire,
          locataire: booking.locataire,
          objet: {
            titre: booking.listing.titre,
            description: booking.listing.description,
            ville: booking.listing.ville,
            prixNeufEstime: booking.listing.prixNeufEstime ? Number(booking.listing.prixNeufEstime) : null,
          },
          dateDebut: booking.dateDebut,
          dateFin: booking.dateFin,
          modeRemise: booking.modeRemise,
          montantLocation: Number(booking.montantLocation),
          fraisServiceLocataire: Number(booking.fraisServiceLocataire),
          fraisPointRelais: booking.fraisPointRelais ? Number(booking.fraisPointRelais) : null,
          commissionProprietaire: Number(booking.commissionProprietaire),
          montantCaution: Number(booking.montantCaution),
          contratAccepteProprietaireLe: booking.contratAccepteProprietaireLe,
          contratAccepteLocataireLe: booking.contratAccepteLocataireLe,
        }}
      />

      <p className="print:hidden">
        <Link href={`/membre/reservations/${booking.id}`} className="text-brand underline">
          Retour à la réservation
        </Link>
      </p>
    </article>
  );
}
