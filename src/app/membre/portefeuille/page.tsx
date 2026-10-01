import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { demarrerOnboardingStripe } from "./actions";

export const metadata = { title: "Portefeuille" };

type Props = { searchParams: Promise<{ onboarding?: string }> };

export default async function PortefeuillePage({ searchParams }: Props) {
  const params = await searchParams;
  let user = await getOrCreateUser();

  if (!user) {
    return <p className="text-gray-600">Connectez-vous pour accéder à votre portefeuille.</p>;
  }

  // Filet de sécurité si le webhook Stripe (account.updated) n'est pas encore
  // configuré côté dashboard : on revérifie l'état du compte à l'affichage.
  if (user.stripeAccountId && !user.stripeOnboardingDone) {
    try {
      const compte = await stripe.accounts.retrieve(user.stripeAccountId);
      if (compte.charges_enabled && compte.payouts_enabled) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { stripeOnboardingDone: true },
        });
      }
    } catch {
      // Compte pas encore consultable ou erreur réseau — on ignore, le webhook
      // ou un prochain chargement de page corrigera le statut.
    }
  }

  const bookings = await prisma.booking.findMany({
    where: { proprietaireId: user.id },
    include: { listing: true, transaction: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Portefeuille</h1>

      {params.onboarding === "retour" && !user.stripeOnboardingDone && (
        <p className="mt-4 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Votre inscription Stripe semble incomplète. Vous pouvez la reprendre
          ci-dessous.
        </p>
      )}

      <div className="mt-6 rounded border p-4">
        <h2 className="font-medium">Paiements (Stripe Connect)</h2>
        {user.stripeOnboardingDone ? (
          <p className="mt-2 text-sm text-green-700">
            Votre compte Stripe est actif — vous pouvez recevoir des paiements.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Complétez votre inscription Stripe Connect pour pouvoir recevoir
              les paiements de vos locations.
            </p>
            <form action={demarrerOnboardingStripe} className="mt-3">
              <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
                {user.stripeAccountId ? "Reprendre mon inscription Stripe" : "Démarrer mon inscription Stripe"}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="mt-6 rounded border p-4">
        <h2 className="font-medium">Revenus & reversements</h2>
        <p className="mt-1 text-sm text-gray-500">
          Versement hebdomadaire du solde disponible, une fois la location
          clôturée (état des lieux de retour validé).
        </p>

        {bookings.length === 0 ? (
          <p className="mt-4 text-gray-600">Aucune location pour le moment.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {bookings.map((booking) => {
              const net = Number(booking.montantLocation) - Number(booking.commissionProprietaire);
              return (
                <li key={booking.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <div>
                    <p>{booking.listing.titre}</p>
                    <p className="text-gray-500">
                      {new Date(booking.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(booking.dateFin).toLocaleDateString("fr-FR")} · {booking.statut}
                    </p>
                  </div>
                  <p className="font-medium">
                    {booking.statut === "CLOTUREE" ? "Reversé : " : "Net attendu : "}
                    {net.toFixed(2)} €
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
