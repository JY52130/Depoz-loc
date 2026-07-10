import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "Louer plutôt qu'acheter, près de chez soi",
  description:
    "Trouvez et louez des objets près de chez vous en France métropolitaine : outillage, jardinage, électroménager, high-tech, sport et bien plus.",
};

export default function AccueilPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depozloc.fr";

  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DepozLoc",
    url: siteUrl,
  };

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DepozLoc",
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
          DepozLoc, la marketplace de location d&apos;objets entre
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
        <p className="mt-2 text-gray-600">
          Les pages de catégorie (et catégorie × ville) seront générées ici en
          SSG/ISR à partir des données de la table Category — Phase 2.
        </p>
      </section>

      <AdSlot slot="1234567890" />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Comment ça marche</h2>
        <p className="mt-2 text-gray-600">
          Réassurance, avis, points relais —{" "}
          <Link href="/comment-ca-marche" className="underline">
            voir le détail
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
