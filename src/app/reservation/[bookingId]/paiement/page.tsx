import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { PaiementForm } from "@/components/PaiementForm";

export const metadata = { title: "Paiement de la réservation" };

type Props = { params: Promise<{ bookingId: string }> };

export default async function PaiementPage({ params }: Props) {
  const { bookingId } = await params;

  const user = await getOrCreateUser();
  if (!user) {
    redirect(`/connexion?redirect=/reservation/${bookingId}/paiement`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true, transaction: true },
  });

  if (!booking || booking.locataireId !== user.id || !booking.transaction) {
    notFound();
  }

  if (booking.statut !== "RESERVEE") {
    redirect(`/membre/mes-locations`);
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    booking.transaction.stripePaymentIntentId!
  );

  if (!paymentIntent.client_secret) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold">Paiement de votre réservation</h1>
      <div className="mt-4 rounded bg-gray-50 p-4 text-sm">
        <p>{booking.listing.titre}</p>
        <p className="mt-1 text-gray-600">
          Total à payer : {booking.transaction.montantTotal.toString()} €
        </p>
        <p className="mt-1 text-gray-600">
          Caution (empreinte, non débitée) : {booking.montantCaution.toString()} €
        </p>
      </div>

      <div className="mt-6">
        <PaiementForm clientSecret={paymentIntent.client_secret} bookingId={booking.id} />
      </div>
    </main>
  );
}
