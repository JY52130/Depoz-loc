import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { CATEGORIES } from "@/lib/categories";

export const metadata = {
  title: "Louer plutôt qu'acheter, près de chez soi",
  description:
    "Trouvez et louez des objets près de chez vous en France métropolitaine : outillage, jardinage, électroménager, high-tech, sport et bien plus.",
};

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
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Louer plutôt qu&apos;acheter, près de chez soi
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Dépôt Malin, la marketplace de location d&apos;objets entre
          particuliers et professionnels en France métropolitaine.
        </p>

        <form
          action="/recherche"
          className="mx-auto mt-8 flex max-w-xl gap-2"
        >
          <input
            type="text"
            name="q"
            placeholder="Que cherchez-vous à louer ?"
            className="flex-1 rounded border px-4 py-3"
          />
          <button
            type="submit"
            className="rounded bg-black px-6 py-3 text-white"
          >
            Rechercher
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Catégories</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((categorie) => (
            <li key={categorie.slug}>
              <Link
                href={`/location/${categorie.slug}`}
                className="block h-full rounded border p-4 hover:border-black"
              >
                <span className="font-medium">{categorie.nom}</span>
                <span className="mt-1 block text-sm text-gray-600">
                  {categorie.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="1234567890" />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Comment ça marche</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          <li>
            <p className="font-medium">1. Trouvez l&apos;objet</p>
            <p className="mt-1 text-gray-600">
              Choisissez une catégorie, puis filtrez par ville et par distance
              pour trouver ce qu&apos;il vous faut près de chez vous.
            </p>
          </li>
          <li>
            <p className="font-medium">2. Réservez vos dates</p>
            <p className="mt-1 text-gray-600">
              Sélectionnez la période sur le calendrier. Le prix et la caution
              sont affichés à l&apos;avance, sans surprise.
            </p>
          </li>
          <li>
            <p className="font-medium">3. Récupérez-le</p>
            <p className="mt-1 text-gray-600">
              En main propre auprès du propriétaire, ou dans notre point relais
              de Chaumont. Rendez-le à la date prévue, c&apos;est tout.
            </p>
          </li>
        </ol>
        <p className="mt-6">
          <Link href="/comment-ca-marche" className="underline">
            En savoir plus
          </Link>
        </p>
      </section>
    </main>
  );
}
