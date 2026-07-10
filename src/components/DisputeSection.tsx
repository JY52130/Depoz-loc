import { ouvrirLitige } from "@/app/membre/reservations/[bookingId]/actions";

type Dispute = {
  id: string;
  motif: string;
  statut: string;
  decision: string | null;
  montantCautionRetenu: unknown;
};

type BookingLite = { id: string; statut: string; dispute: Dispute | null };

export function DisputeSection({ booking }: { booking: BookingLite }) {
  if (booking.dispute) {
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <h2 className="font-medium">Litige {booking.dispute.statut === "OUVERT" ? "en cours" : booking.dispute.statut.toLowerCase()}</h2>
        <p className="mt-1">Motif : {booking.dispute.motif}</p>
        {booking.dispute.decision && <p className="mt-1">Décision : {booking.dispute.decision}</p>}
        <p className="mt-2 text-xs text-red-700">
          Traité en interne par notre équipe, par email (section 6.6). Nous vous recontacterons.
        </p>
      </section>
    );
  }

  if (!["EN_COURS", "RETOURNEE"].includes(booking.statut)) {
    return null;
  }

  return (
    <section className="rounded border p-4">
      <h2 className="font-medium">Signaler un problème</h2>
      <p className="mt-1 text-sm text-gray-500">
        En cas de dommage ou de désaccord, ouvrez un litige — il sera traité
        par notre équipe par email.
      </p>
      <form action={ouvrirLitige} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="bookingId" value={booking.id} />
        <textarea
          name="motif"
          required
          rows={3}
          placeholder="Décrivez le problème rencontré…"
          className="rounded border px-3 py-2 text-sm"
        />
        <button type="submit" className="w-fit rounded border border-red-300 px-4 py-2 text-sm text-red-700">
          Ouvrir un litige
        </button>
      </form>
    </section>
  );
}
