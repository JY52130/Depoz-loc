import Link from "next/link";
import { TitreAvecMalin } from "@/components/Malin";
import { EMPLACEMENTS_BANDEAU, HAUTEUR_IMAGE_BANDEAU, LARGEUR_IMAGE_BANDEAU } from "@/lib/bandeaux";

export const metadata = {
  title: "Annoncer sur Dépôt Malin",
  description:
    "Commerçants de Saint-Dizier et des environs : faites connaître votre commerce avec un bandeau publicitaire sur Dépôt Malin.",
};

export default function AnnoncerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Annoncer sur Dépôt Malin" pose="promotion" />
      <p className="mt-4 text-gray-700">
        Vous tenez un commerce à Saint-Dizier ou dans les environs ? Les visiteurs de Dépôt Malin sont vos voisins :
        présentez-leur votre commerce avec un bandeau sur le site.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Emplacements et prix</h2>
      <table className="mt-3 w-full border-collapse text-left text-sm">
        <caption className="sr-only">Prix des bandeaux publicitaires, toutes taxes comprises</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-2 pr-4 font-medium">
              Emplacement
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              1 semaine
            </th>
            <th scope="col" className="py-2 font-medium">
              1 mois
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(EMPLACEMENTS_BANDEAU).map(([cle, e]) => (
            <tr key={cle} className="border-b">
              <th scope="row" className="py-2 pr-4 font-normal">
                <span className="font-medium">{e.nom}</span>
                <span className="block text-gray-600">{e.description}</span>
              </th>
              <td className="py-2 pr-4">{e.prixSemaine} €</td>
              <td className="py-2">{e.prixMois} €</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 text-xl font-semibold">Comment ça se passe</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
        <li>
          Écrivez-nous depuis la page{" "}
          <Link href="/contact" className="font-medium text-brand underline hover:text-brand-dark">
            Contact
          </Link>{" "}
          en choisissant le sujet « Publicité sur le site », avec l&apos;emplacement et les dates souhaités.
        </li>
        <li>Nous vous envoyons un lien de paiement sécurisé par carte bancaire.</li>
        <li>
          Envoyez-nous votre image ({LARGEUR_IMAGE_BANDEAU} × {HAUTEUR_IMAGE_BANDEAU} pixels conseillés) et le lien de
          votre site ou de votre page Facebook. Nous pouvons aussi la préparer avec vous.
        </li>
        <li>Votre bandeau s&apos;affiche aux dates prévues. À la fin, nous vous indiquons le nombre de vues et de clics.</li>
      </ol>

      <p className="mt-8 text-sm text-gray-600">
        Chaque bandeau porte la mention « Publicité ». Pas d&apos;animation ni de fenêtre qui s&apos;ouvre toute seule :
        le site reste agréable et accessible à tous. Aucun cookie publicitaire n&apos;est utilisé.
      </p>
    </main>
  );
}
