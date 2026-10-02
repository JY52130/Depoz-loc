import { AvertissementJuridique } from "@/components/AvertissementJuridique";
import { ContratLocation } from "@/components/ContratLocation";

export const metadata = { title: "Contrat de location type" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Contrat de location type</h1>
      <AvertissementJuridique />
      <p className="mb-6 text-gray-700">
        Chaque location sur Dépôt Malin est encadrée par ce contrat. Il est rempli
        automatiquement avec les informations de la réservation, puis accepté en
        ligne par le locataire et par le propriétaire. Les éléments entre crochets
        sont complétés au moment de la réservation.
      </p>
      <ContratLocation />
    </article>
  );
}
