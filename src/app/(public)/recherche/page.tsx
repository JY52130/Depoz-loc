import Link from "next/link";
import { rechercherAnnonces, rechercherAnnoncesProximite } from "@/lib/recherche";
import type { DeliveryMode } from "@prisma/client";
import { BadgeALaUne, classeCarte } from "@/components/BadgeALaUne";
import { estMiseEnAvant } from "@/lib/miseEnAvant";

export const metadata = { title: "Résultats de recherche" };

type Props = {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    ville?: string;
    prixMax?: string;
    mode?: string;
    lat?: string;
    lng?: string;
    rayon?: string;
    tri?: string;
  }>;
};

export default async function RecherchePage({ searchParams }: Props) {
  const params = await searchParams;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const rayon = params.rayon ? Number(params.rayon) : 25;

  const rechercheGeolocalisee = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  const resultats = rechercheGeolocalisee
    ? await rechercherAnnoncesProximite(lat!, lng!, rayon, params.categorie)
    : await rechercherAnnonces({
        texte: params.q,
        categorieSlug: params.categorie,
        ville: params.ville,
        prixMax: params.prixMax ? Number(params.prixMax) : undefined,
        modeRemise: params.mode as DeliveryMode | undefined,
        tri: params.tri === "prix" ? "prix" : "recent",
      });

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Résultats de recherche</h1>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Rechercher un objet…"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="ville"
          defaultValue={params.ville}
          placeholder="Ville"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="prixMax"
          defaultValue={params.prixMax}
          placeholder="Prix max /jour"
          className="w-36 rounded-lg border px-3 py-2 text-sm"
        />
        <select name="mode" defaultValue={params.mode ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous modes de remise</option>
          <option value="P2P">Main à main</option>
          <option value="POINT_RELAIS">Commerçant relais</option>
          <option value="LIVRAISON">Livraison possible</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark">
          Filtrer
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        {rechercheGeolocalisee
          ? `Recherche géolocalisée dans un rayon de ${rayon} km.`
          : "Astuce : ajoutez ?lat=…&lng=…&rayon=… à l'URL pour une recherche « près de chez moi » (PostGIS)."}
      </p>

      {resultats.length === 0 ? (
        <p className="mt-8 text-gray-600">Aucune annonce ne correspond à ces critères pour le moment.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((annonce) => (
            <li key={annonce.id} className={classeCarte(estMiseEnAvant(annonce.misEnAvantJusquau))}>
              {estMiseEnAvant(annonce.misEnAvantJusquau) && <BadgeALaUne />}
              <Link href={`/annonce/${annonce.slug}`} className="block font-medium hover:underline">
                {annonce.titre}
              </Link>
              <p className="mt-1 text-sm text-gray-500">{annonce.ville}</p>
              {"distanceMetres" in annonce && (
                <p className="mt-1 text-sm text-gray-500">
                  {(annonce.distanceMetres / 1000).toFixed(1)} km
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
