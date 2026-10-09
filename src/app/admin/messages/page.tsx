import { prisma } from "@/lib/prisma";
import { changerTraitementMessage } from "./actions";

export const metadata = { title: "Messages de contact" };

const dateHeure = (d: Date) =>
  d.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

export default async function AdminMessagesPage() {
  const messages = await prisma.messageContact.findMany({
    orderBy: [{ traite: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  const aTraiter = messages.filter((m) => !m.traite).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages de contact</h1>
        <p className="mt-1 text-sm text-gray-600">
          {aTraiter} message(s) à traiter. Répondez avec le lien « Répondre par e-mail », puis marquez le message comme
          traité.
        </p>
      </div>
      {messages.length === 0 ? (
        <p className="text-sm text-gray-600">Aucun message pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-xl border p-4 text-sm shadow-sm ${m.traite ? "bg-gray-50" : "bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">
                    {m.sujet}
                    {m.traite && <span className="ml-2 text-gray-600">(traité)</span>}
                  </h2>
                  <p className="text-gray-600">
                    {m.nom} · {m.email} · {dateHeure(m.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}`}
                    className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark"
                  >
                    Répondre par e-mail<span className="sr-only"> à {m.nom}</span>
                  </a>
                  <form action={changerTraitementMessage}>
                    <input type="hidden" name="messageId" value={m.id} />
                    <input type="hidden" name="traite" value={m.traite ? "false" : "true"} />
                    <button
                      type="submit"
                      className="rounded-lg border border-brand px-3 py-1.5 font-medium text-brand-dark hover:bg-brand-50"
                    >
                      {m.traite ? "Remettre à traiter" : "Marquer comme traité"}
                      <span className="sr-only"> : message de {m.nom}</span>
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-gray-800">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
