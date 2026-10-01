import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { CATEGORIES } from "@/lib/categories";

export const metadata = {
  title: "Louer plutôt qu'acheter, près de chez soi",
  description:
    "Trouvez et louez des objets près de chez vous en France métropolitaine : outillage, jardinage, électroménager, high-tech, sport et bien plus.",
};

// Photos libres de droits (licence Unsplash), une par catégorie.
const PHOTOS_CATEGORIES: Record<string, string> = {
  "outillage-bricolage": "photo-1572981779307-38b8cabb2407",
  "jardinage-exterieur": "photo-1458245201577-fc8a130b8829",
  electromenager: "photo-1693875161689-7787889a4c21",
  "informatique-high-tech": "photo-1589113050289-1c654e7e305d",
  "image-son": "photo-1495707902641-75cac588d2e9",
  "sport-loisirs": "photo-1505705694340-019e1e335916",
  "camping-plein-air": "photo-1504280390367-361c6d9f38f4",
  "bebe-enfant": "photo-1528121108018-743eef2e4a7a",
  "evenementiel-reception": "photo-1780682569879-f271082ae2cd",
  "mobilier-deco": "photo-1555041469-a586c61ea9bc",
  "auto-moto-velo": "photo-1780311996880-0a85318ee890",
  "instruments-musique": "photo-1608660890512-cfd02ae3ae3d",
};

const ETAPES = [
  {
    titre: "Trouvez l'objet",
    texte: "Choisissez une catégorie, puis filtrez par ville et par distance pour trouver ce qu'il vous faut près de chez vous.",
  },
  {
    titre: "Réservez vos dates",
    texte: "Sélectionnez la période sur le calendrier. Le prix et la caution sont affichés à l'avance, sans surprise.",
  },
  {
    titre: "Récupérez-le",
    texte: "En main propre auprès du propriétaire, ou dans notre point relais de Chaumont. Rendez-le à la date prévue, c'est tout.",
  },
];

export default function AccueilPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dépôt Malin",
    url: siteUrl,
  };

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dépôt Malin",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/recherche?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main>
      <JsonLd data={organisationJsonLd} />
      <JsonLd data={siteJsonLd} />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-100 opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-24 h-64 w-64 rounded-full bg-accent-light opacity-70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 text-center md:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-sm font-medium text-brand-dark shadow-sm">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Location entre particuliers et professionnels
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink md:text-6xl">
            Louer plutôt qu&apos;acheter,{" "}
            <span className="text-brand">près de chez soi</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            Perceuse, tente, poussette, vidéoprojecteur… Trouvez l&apos;objet
            qu&apos;il vous faut chez vos voisins, ou gagnez de l&apos;argent avec
            ceux qui dorment dans vos placards.
          </p>

          <form
            action="/recherche"
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border bg-white p-2 shadow-lg shadow-brand/10"
          >
            <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="Que cherchez-vous à louer ?"
              aria-label="Que cherchez-vous à louer ?"
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Rechercher
            </button>
          </form>

          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <li>✓ Inscription gratuite</li>
            <li>✓ Caution calculée automatiquement</li>
            <li>✓ Remise en main propre ou en point relais</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Parcourir les catégories</h2>
            <p className="mt-2 text-gray-600">Tout se loue, ou presque.</p>
          </div>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((categorie) => (
            <li key={categorie.slug}>
              <Link
                href={`/location/${categorie.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="relative block h-32 overflow-hidden bg-brand-50 sm:h-40">
                  {PHOTOS_CATEGORIES[categorie.slug] && (
                    <Image
                      src={`https://images.unsplash.com/${PHOTOS_CATEGORIES[categorie.slug]}?w=800&q=75&auto=format&fit=crop`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="px-5 pt-4 font-semibold text-ink">{categorie.nom}</span>
                <span className="px-5 pt-1 pb-5 text-sm text-gray-500">{categorie.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="1234567890" />

      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">Comment ça marche</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {ETAPES.map((etape, index) => (
              <li key={etape.titre} className="rounded-2xl border bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-lg font-semibold">{etape.titre}</p>
                <p className="mt-2 text-gray-600">{etape.texte}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8">
            <Link href="/comment-ca-marche" className="font-medium text-brand hover:text-brand-dark">
              En savoir plus →
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand px-8 py-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Des objets qui dorment chez vous ?</h2>
            <p className="mt-2 max-w-xl text-brand-100">
              Mettez-les en location en quelques minutes et arrondissez vos fins
              de mois. L&apos;inscription et la publication sont gratuites.
            </p>
          </div>
          <Link
            href="/membre/mes-annonces/nouvelle"
            className="shrink-0 rounded-xl bg-accent px-6 py-3 font-semibold text-ink shadow-sm transition hover:brightness-105"
          >
            Mettre un objet en location
          </Link>
        </div>
      </section>
    </main>
  );
}
