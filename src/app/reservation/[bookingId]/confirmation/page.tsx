import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Confirmation de réservation" };

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
};

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { redirect_status } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });

  const paiementOk = redirect_status === "succeeded";

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      {paiementOk ? (
        <>
          <h1 className="text-2xl font-semibold">Réservation confirmée</h1>
          <p className="mt-4 text-gray-600">
            Votre paiement pour « {booking?.listing.titre} » a bien été pris en
            compte. Le statut de la réservation sera mis à jour dans quelques
            instants (webhook Stripe).
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Paiement en cours de traitement</h1>
          <p className="mt-4 text-gray-600">
            Nous finalisons la vérification de votre paiement. Vous pouvez
            suivre le statut depuis « Mes locations ».
          </p>
        </>
      )}

      <Link href="/membre/mes-locations" className="mt-6 inline-block underline">
        Voir mes locations
      </Link>
    </main>
  );
}
