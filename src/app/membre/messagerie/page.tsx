import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export const metadata = { title: "Messagerie" };

export default async function MessageriePage() {
  const user = await getOrCreateUser();

  const conversations = user
    ? await prisma.conversation.findMany({
        where: { participants: { some: { userId: user.id } } },
        include: {
          booking: { include: { listing: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Messagerie</h1>

      {conversations.length === 0 ? (
        <p className="mt-6 text-gray-600">Aucune conversation pour le moment.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="rounded border p-4">
              <Link
                href={`/membre/reservations/${conversation.bookingId}`}
                className="font-medium hover:underline"
              >
                {conversation.booking?.listing.titre ?? "Conversation"}
              </Link>
              {conversation.messages[0] && (
                <p className="mt-1 truncate text-sm text-gray-500">
                  {conversation.messages[0].contenu}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
