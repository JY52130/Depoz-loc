import { envoyerMessage } from "@/app/membre/reservations/[bookingId]/actions";

type Message = {
  id: string;
  contenu: string;
  expediteurId: string;
  createdAt: Date;
};

export function MessagerieBox({
  conversationId,
  bookingId,
  messages,
  currentUserId,
}: {
  conversationId: string;
  bookingId: string;
  messages: Message[];
  currentUserId: string;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-medium">Messagerie</h2>
      <p className="mt-1 text-sm text-gray-500">
        Utilisez cet espace pour convenir des modalités de remise (main à main).
      </p>

      <div className="mt-4 flex max-h-80 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun message pour l&apos;instant.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[75%] rounded px-3 py-2 text-sm ${
                message.expediteurId === currentUserId
                  ? "self-end bg-brand text-white"
                  : "self-start bg-gray-100"
              }`}
            >
              {message.contenu}
            </div>
          ))
        )}
      </div>

      <form action={envoyerMessage} className="mt-4 flex gap-2">
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          type="text"
          name="contenu"
          required
          placeholder="Votre message…"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
          Envoyer
        </button>
      </form>
    </section>
  );
}
