import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Finances" };

export default async function AdminFinancesPage() {
  const transactions = await prisma.transaction.findMany({
    where: { statut: { in: ["paye", "reverse"] } },
    include: {
      booking: { include: { listing: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalEncaisse = transactions.reduce((s, t) => s + Number(t.montantTotal), 0);
  const totalCommissions = transactions.reduce(
    (s, t) => s + Number(t.booking.fraisServiceLocataire) + Number(t.booking.commissionProprietaire),
    0
  );
  const totalReverse = transactions
    .filter((t) => t.booking.statut === "CLOTUREE")
    .reduce((s, t) => s + (Number(t.booking.montantLocation) - Number(t.booking.commissionProprietaire)), 0);

  const disputesResolus = await prisma.dispute.findMany({
    where: { statut: "RESOLU", montantCautionRetenu: { not: null } },
  });
  const totalCautionsRetenues = disputesResolus.reduce(
    (s, d) => s + Number(d.montantCautionRetenu ?? 0),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Finances</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total encaissé</p>
          <p className="mt-1 text-lg font-semibold">{totalEncaisse.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Commissions plateforme</p>
          <p className="mt-1 text-lg font-semibold">{totalCommissions.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Reversé aux propriétaires</p>
          <p className="mt-1 text-lg font-semibold">{totalReverse.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Cautions retenues (litiges)</p>
          <p className="mt-1 text-lg font-semibold">{totalCautionsRetenues.toFixed(2)} €</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/finances/export" className="text-sm underline">
          Exporter les transactions en CSV
        </Link>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2">Annonce</th>
            <th className="py-2">Montant total</th>
            <th className="py-2">Statut réservation</th>
            <th className="py-2">Statut transaction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2">{t.booking.listing.titre}</td>
              <td className="py-2">{Number(t.montantTotal).toFixed(2)} €</td>
              <td className="py-2">{t.booking.statut}</td>
              <td className="py-2">{t.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
