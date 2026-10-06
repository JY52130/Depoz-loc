import Link from "next/link";
import { Malin } from "@/components/Malin";

// « Faites le tour de votre garage » : idées d'objets à louer, pièce par
// pièce, pour encourager chaque propriétaire à publier plusieurs annonces.
const PIECES: { piece: string; objets: string[] }[] = [
  { piece: "Garage et atelier", objets: ["perceuse", "ponceuse", "échelle", "nettoyeur haute pression", "bétonnière", "scie sauteuse"] },
  { piece: "Jardin", objets: ["tondeuse", "taille-haie", "motoculteur", "broyeur de végétaux", "tonnelle", "barbecue"] },
  { piece: "Maison", objets: ["nettoyeur vapeur", "shampouineuse", "machine à coudre", "appareil à raclette", "robot de cuisine"] },
  { piece: "Fêtes", objets: ["tables et chaises pliantes", "enceinte", "vidéoprojecteur", "guirlandes lumineuses", "machine à barbe à papa"] },
  { piece: "Enfants", objets: ["poussette", "lit parapluie", "porte-bébé", "chaise haute", "piscine à boules"] },
  { piece: "Loisirs et vacances", objets: ["tente", "glacière", "vélo", "porte-vélo", "coffre de toit", "kayak"] },
];

export function IdeesObjets({ ouvert = false }: { ouvert?: boolean }) {
  return (
    <section aria-labelledby="titre-idees-objets" className="mt-6 rounded-3xl bg-creme-fonce p-5">
      <div className="flex items-start gap-4">
        <Malin pose="stockage" classeTaille="h-24 sm:h-28" className="hidden shrink-0 sm:block" />
        <div className="min-w-0">
          <h2 id="titre-idees-objets" className="text-lg font-semibold">
            Faites le tour de votre garage
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            Beaucoup d&apos;objets dorment chez nous et ne servent que quelques jours par an. Chaque annonce est
            gratuite : plus vous en publiez, plus vos voisins vous trouvent.
          </p>
        </div>
      </div>
      <details open={ouvert} className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-brand-dark">Voir des idées, pièce par pièce</summary>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {PIECES.map((p) => (
            <li key={p.piece} className="rounded-xl bg-white p-3">
              <h3 className="font-medium">{p.piece}</h3>
              <p className="mt-1 text-gray-700">{p.objets.join(", ")}.</p>
            </li>
          ))}
        </ul>
      </details>
      <Link
        href="/membre/mes-annonces/nouvelle"
        className="mt-4 inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Publier un objet
      </Link>
    </section>
  );
}
