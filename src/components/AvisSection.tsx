import { creerAvis } from "@/app/membre/reservations/[bookingId]/actions";

type Review = { id: string; auteurId: string; cibleId: string; note: number; commentaire: string | null };
type BookingLite = { id: string; statut: string; locataireId: string; proprietaireId: string; reviews: Review[] };

export function AvisSection({
  booking,
  role,
  userId,
}: {
  booking: BookingLite;
  role: "locataire" | "proprietaire";
  userId: string;
}) {
  if (booking.statut !== "CLOTUREE") return null;

  const monAvis = booking.reviews.find((r) => r.auteurId === userId);
  const avisRecu = booking.reviews.find((r) => r.cibleId === userId);
  const autrePartie = role === "locataire" ? "propriétaire" : "locataire";

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">Avis</h2>

      {avisRecu && (
        <p className="mt-2 text-sm text-gray-600">
          Avis reçu du {autrePartie === "locataire" ? "propriétaire" : "locataire"} : {avisRecu.note}/5
          {avisRecu.commentaire ? ` — « ${avisRecu.commentaire} »` : ""}
        </p>
      )}

      {monAvis ? (
        <p className="mt-2 text-sm text-gray-600">
          Vous avez noté {autrePartie} : {monAvis.note}/5
        </p>
      ) : (
        <form action={creerAvis} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="flex flex-col gap-1 text-sm">
            Note pour {autrePartie === "locataire" ? "le locataire" : "le propriétaire"}
            <select name="note" required defaultValue="" className="rounded-lg border px-3 py-2">
              <option value="" disabled>
                Choisir une note
              </option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}/5
                </option>
              ))}
            </select>
          </label>
          <textarea
            name="commentaire"
            placeholder="Commentaire (optionnel)"
            rows={2}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button type="submit" className="w-fit rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
            Envoyer mon avis
          </button>
        </form>
      )}
    </section>
  );
}
