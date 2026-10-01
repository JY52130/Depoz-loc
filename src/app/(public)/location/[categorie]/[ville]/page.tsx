import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

// Page de destination SEO — catégorie × ville (section 12.1), cœur du trafic organique.
// Exemple d'URL cible : /location/petit-outillage/chaumont

export const revalidate = 3600;

type Props = { params: Promise<{ categorie: string; ville: string }> };

// Base injoignable au build : aucune page pré-générée, rendu à la première visite (ISR).
export async function generateStaticParams() {
  const listings = await prisma.listing
    .findMany({
      where: { statut: "EN_LIGNE", ville: { not: null } },
      select: { ville: true, category: { select: { slug: true } } },
      distinct: ["ville", "categoryId"],
    })
    .catch(() => []);

  return listings
    .filter((l) => l.ville)
    .map((l) => ({
      categorie: l.category.slug,
      ville: slugify(l.ville as string),
    }));
}

async function getDonnees(categorieSlug: string, villeSlug: string) {
  const categorie = await prisma.category.findUnique({ where: { slug: categorieSlug } });
  if (!categorie) return null;

  const listings = await prisma.listing.findMany({
    where: {
      categoryId: categorie.id,
      statut: "EN_LIGNE",
    },
  });

  // Le slug de ville est dérivé du nom réel (section 12.1) — on filtre côté
  // app plutôt qu'en base tant que la ville n'est pas normalisée en colonne dédiée.
  const listingsVille = listings.filter((l) => l.ville && slugify(l.ville) === villeSlug);
  const nomVille = listingsVille[0]?.ville ?? villeSlug.replace(/-/g, " ");

  return { categorie, listingsVille, nomVille };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie, ville } = await params;
  const donnees = await getDonnees(categorie, ville);
  if (!donnees) return { title: "Page introuvable" };

  return {
    title: `Location ${donnees.categorie.nom} à ${donnees.nomVille}`,
    description: `Louez du matériel (${donnees.categorie.nom}) près de ${donnees.nomVille}. Réservation en ligne, remise en main propre ou en point relais.`,
  };
}

export default async function CategorieVillePage({ params }: Props) {
  const { categorie, ville } = await params;
  const donnees = await getDonnees(categorie, ville);
  if (!donnees) notFound();

  const { categorie: cat, listingsVille, nomVille } = donnees;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: cat.nom, item: `${siteUrl}/location/${cat.slug}` },
      { "@type": "ListItem", position: 3, name: nomVille, item: `${siteUrl}/location/${cat.slug}/${ville}` },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={breadcrumb} />
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">Accueil</Link> {" / "}
        <Link href={`/location/${cat.slug}`} className="hover:underline">{cat.nom}</Link>{" / "}
        <span>{nomVille}</span>
      </nav>
      <h1 className="mt-2 text-3xl font-semibold">
        {cat.nom} à {nomVille}
      </h1>
      <p className="mt-2 text-gray-600">
        {listingsVille.length} annonce(s) disponible(s) autour de {nomVille}.
      </p>

      {listingsVille.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listingsVille.map((listing) => (
            <li key={listing.id} className="rounded border p-4">
              <Link href={`/annonce/${listing.slug}`} className="font-medium hover:underline">
                {listing.titre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
