import Link from "next/link";
import { TitreAvecMalin } from "@/components/Malin";

export const metadata = {
  title: "Pourquoi louer ?",
  description:
    "Louer plutôt qu'acheter : faire des économies, gagner un complément de revenus, moins jeter et rencontrer ses voisins.",
};

const RAISONS = [
  {
    icone: "💶",
    titre: "Faire des économies",
    texte:
      "Une perceuse, une remorque ou une tente ne servent que quelques jours par an. Pourquoi les acheter au prix fort ? En louant, vous payez seulement le temps dont vous avez besoin, sans frais d'entretien ni place perdue dans le garage.",
  },
  {
    icone: "🪙",
    titre: "Gagner un complément de revenus",
    texte:
      "Vos objets qui dorment dans un placard peuvent vous rapporter de l'argent. Vous fixez vous-même le prix, les dates et la façon de remettre l'objet. Une caution protège votre bien.",
  },
  {
    icone: "🌱",
    titre: "Moins jeter, moins fabriquer",
    texte:
      "C'est surtout la fabrication d'un objet qui pèse sur la planète. Un objet partagé entre plusieurs voisins, c'est autant d'objets neufs qui n'ont pas besoin d'être produits.",
  },
  {
    icone: "🤝",
    titre: "Créer du lien près de chez soi",
    texte:
      "Louer à un voisin, c'est aussi échanger un conseil, rendre service et faire vivre son quartier ou son village. Avec Dépôt Malin, tout se passe près de chez vous.",
  },
];

export default function PourquoiLouerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Pourquoi louer ?" pose="malin" />
      <p className="mt-6 text-lg text-gray-700">
        Acheter un objet pour s&apos;en servir une ou deux fois, c&apos;est cher et encombrant.
        Le louer à quelqu&apos;un près de chez vous, c&apos;est plus simple, plus économique et
        plus responsable.
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {RAISONS.map((raison) => (
          <li key={raison.titre} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              <span aria-hidden="true">{raison.icone}</span>
              {raison.titre}
            </h2>
            <p className="mt-3 text-gray-700">{raison.texte}</p>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-3xl bg-brand-50 p-8">
        <h2 className="text-xl font-semibold">Prêt à essayer ?</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/recherche"
            className="rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            Trouver un objet à louer
          </Link>
          <Link
            href="/membre/mes-annonces/nouvelle"
            className="rounded-full border border-brand px-5 py-2.5 font-semibold text-brand hover:bg-white"
          >
            Mettre un objet en location
          </Link>
        </div>
        <p className="mt-4 text-gray-700">
          Envie de savoir comment se passe une location ?{" "}
          <Link href="/comment-ca-marche" className="font-medium text-brand underline hover:text-brand-dark">
            Voir comment ça marche
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
