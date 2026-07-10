import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// Les Route Handlers ne passent pas par le layout React (admin/layout.tsx) :
// le contrôle de rôle admin doit donc être répété ici explicitement.
export async function GET() {
  const user = await getOrCreateUser();
  if (!user || !user.estAdmin) {
    return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
  }

  const transactions = await prisma.transaction.findMany({
    include: { booking: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
  });

  const entetes = [
    "bookingId",
    "annonce",
    "montantLocation",
    "fraisServiceLocataire",
    "commissionProprietaire",
    "montantTotal",
    "statutReservation",
    "statutTransaction",
    "date",
  ];

  const lignes = transactions.map((t) =>
    [
      t.bookingId,
      `"${t.booking.listing.titre.replace(/"/g, '""')}"`,
      Number(t.booking.montantLocation).toFixed(2),
      Number(t.booking.fraisServiceLocataire).toFixed(2),
      Number(t.booking.commissionProprietaire).toFixed(2),
      Number(t.montantTotal).toFixed(2),
      t.booking.statut,
      t.statut,
      t.createdAt.toISOString(),
    ].join(",")
  );

  const csv = [entetes.join(","), ...lignes].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="depozloc-transactions-${Date.now()}.csv"`,
    },
  });
}
