import { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";

export const metadata = { title: "Tarifs & commissions" };

export default function TarifsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Tarifs & commissions</h1>
      <ul className="mt-6 space-y-2 text-gray-700">
        <li>Frais de service locataire : 5 % du montant de la location.</li>
        <li>Commission propriétaire : 10 % du montant de la location.</li>
        <li>Inscription et publication d&apos;annonces : gratuites.</li>
        <li>
          Frais point relais (optionnel) : {FRAIS_POINT_RELAIS} € par location,
          à la charge du locataire.
        </li>
      </ul>
    </main>
  );
}
