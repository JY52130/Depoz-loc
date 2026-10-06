import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { MessagerieBox } from "@/components/MessagerieBox";
import { EtatDesLieuxSection } from "@/components/EtatDesLieuxSection";
import { ContratSection } from "@/components/ContratSection";
import { ClotureSection } from "@/components/ClotureSection";
import { AvisSection } from "@/components/AvisSection";
import { DisputeSection } from "@/components/DisputeSection";
import { libellePeriode } from "@/lib/periodeLocation";

export const metadata = { title: "Ma réservation" };

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ erreur?: string }>;
};

export default async function ReservationDetailPage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { erreur } = await searchParams;
  const user = await getOrCreateUser();
  if (!user) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: true,
      locataire: { select: { id: true, nom: true, email: true } },
      proprietaire: { select: { id: true, nom: true, email: true } },
      transaction: true,
      relayPoint: true,
      conditionReports: { orderBy: { createdAt: "asc" } },
      dispute: true,
      reviews: true,
      conversation: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          participants: true,
        },
      },
    },
  });

  if (!booking || (booking.locataireId !== user.id && booking.proprietaireId !== user.id)) {
    notFound();
  }

  const role: "locataire" | "proprietaire" = booking.locataireId === user.id ? "locataire" : "proprietaire";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{booking.listing.titre}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {libellePeriode(booking.dateDebut, booking.dateFin, { day: "numeric", month: "numeric", year: "numeric" })} · Statut : {booking.statut}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Vous êtes {role === "locataire" ? "le locataire" : "le propriétaire"} de cette réservation.
        </p>
      </div>

      {booking.modeRemise === "LIVRAISON" && (
        <section aria-labelledby="titre-remise" className="rounded-xl border bg-white p-4 text-sm shadow-sm">
          <h2 id="titre-remise" className="font-medium">Livraison par le propriétaire</h2>
          <p className="mt-1 text-gray-700">
            Adresse : {booking.adresseLivraison}
            {booking.fraisLivraison != null && ` · ${Number(booking.fraisLivraison).toFixed(2).replace(".", ",")} € aller-retour`}
          </p>
          <p className="mt-1 text-gray-600">
            {role === "proprietaire"
              ? "Vous apportez l'objet à cette adresse puis venez le rechercher à la fin de la location. Fixez les heures avec le locataire par la messagerie."
              : "Le propriétaire apporte l'objet à cette adresse puis vient le rechercher. Fixez les heures ensemble par la messagerie."}
          </p>
        </section>
      )}

      {booking.modeRemise === "POINT_RELAIS" && booking.relayPoint && (
        <section aria-labelledby="titre-remise" className="rounded-xl border bg-white p-4 text-sm shadow-sm">
          <h2 id="titre-remise" className="font-medium">Commerçant relais</h2>
          <p className="mt-1 text-gray-700">
            {booking.relayPoint.nom} · {booking.relayPoint.adresse}, {booking.relayPoint.codePostal}{" "}
            {booking.relayPoint.ville}
            {booking.relayPoint.horaires && ` · ${booking.relayPoint.horaires}`}
          </p>
          <p className="mt-1 text-gray-600">
            {role === "proprietaire"
              ? "Vous déposez l'objet chez ce commerçant avant le début de la location, et vous l'y récupérez à la fin."
              : "Vous retirez l'objet chez ce commerçant au début de la location, et vous l'y rapportez à la fin."}
          </p>
        </section>
      )}

      {erreur && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}

      <ContratSection booking={booking} role={role} />

      <EtatDesLieuxSection booking={booking} />

      <ClotureSection booking={booking} role={role} />

      <DisputeSection booking={booking} />

      <AvisSection booking={booking} role={role} userId={user.id} />

      {booking.conversation && (
        <MessagerieBox
          conversationId={booking.conversation.id}
          bookingId={booking.id}
          messages={booking.conversation.messages}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
