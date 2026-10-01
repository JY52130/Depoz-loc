import { validerRetourSansDommage } from "@/app/membre/reservations/[bookingId]/actions";

type BookingLite = { id: string; statut: string; modeRemise: string };

export function ClotureSection({ booking, role }: { booking: BookingLite; role: "locataire" | "proprietaire" }) {
  if (booking.statut === "CLOTUREE") {
    return (
      <section className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Location clôturée : la caution a été libérée et le paiement reversé au propriétaire.
      </section>
    );
  }

  if (booking.statut !== "RETOURNEE") {
    return null;
  }

  if (booking.modeRemise === "POINT_RELAIS") {
    return (
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Clôture de la location</h2>
        <p className="mt-1 text-sm text-gray-600">
          L&apos;objet est passé par le point relais : c&apos;est le personnel du
          point relais qui vérifie le retour et déclenche la clôture depuis
          le back-office.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">Clôture de la location</h2>
      {role === "proprietaire" ? (
        <>
          <p className="mt-1 text-sm text-gray-600">
            Une fois l&apos;objet récupéré et vérifié, confirmez qu&apos;il n&apos;y a pas de
            dommage pour libérer la caution du locataire et débloquer votre paiement.
          </p>
          <form action={validerRetourSansDommage} className="mt-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
              Confirmer qu&apos;il n&apos;y a pas de dommage
            </button>
          </form>
        </>
      ) : (
        <p className="mt-1 text-sm text-gray-600">
          En attente de la confirmation du propriétaire après vérification du
          retour de l&apos;objet.
        </p>
      )}
    </section>
  );
}
