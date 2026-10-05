import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/AdSlot";
import { annonceVisible } from "@/lib/dureeAnnonce";
import { BadgeALaUne, classeCarte } from "@/components/BadgeALaUne";
import { estMiseEnAvant, trierMisesEnAvant } from "@/lib/miseEnAvant";

// Page de destination SEO — une par catégorie de 1er niveau (section 12.1).
// Générée en SSG et revalidée périodiquement (ISR).

export const revalidate = 3600;

type Props = { params: Promise<{ categorie: string }> };

// Base injoignable au build (ex. premier déploiement) : on ne pré-génère
// rien, les pages seront rendues à la première visite (ISR).
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((c) => ({ categorie: c.slug }));
  } catch {
    return [];
  }
}

async function getCategorie(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const cat = await getCategorie(categorie);
  if (!cat) return { title: "Catégorie introuvable" };

  return {
    title: `Louer du matériel : ${cat.nom}`,
    description: cat.description ?? `Location d'objets dans la catégorie ${cat.nom} près de chez vous, en France métropolitaine.`,
  };
}

export default async function CategoriePage({ params }: Props) {
  const { categorie } = await params;
  const cat = await getCategorie(categorie);
  if (!cat) notFound();

  const [listingsBruts, villes] = await Promise.all([
    prisma.listing.findMany({
      where: { categoryId: cat.id, ...annonceVisible() },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    prisma.listing.findMany({
      where: { categoryId: cat.id, ...annonceVisible(), ville: { not: null } },
      select: { ville: true },
      distinct: ["ville"],
      take: 30,
    }),
  ]);
  const listings = trierMisesEnAvant(listingsBruts);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{cat.nom}</h1>
      {cat.description && <p className="mt-2 text-gray-600">{cat.description}</p>}

      {villes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500">Rechercher par ville</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {villes.map(
              (v) =>
                v.ville && (
                  <Link
                    key={v.ville}
                    href={`/location/${cat.slug}/${v.ville.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    {v.ville}
                  </Link>
                )
            )}
          </div>
        </div>
      )}

      <AdSlot slot="2234567890" />

      <div className="mt-8">
        {listings.length === 0 ? (
          <p className="text-gray-600">Aucune annonce en ligne dans cette catégorie pour le moment.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <li key={listing.id} className={classeCarte(estMiseEnAvant(listing.misEnAvantJusquau))}>
                {estMiseEnAvant(listing.misEnAvantJusquau) && <BadgeALaUne />}
                <Link href={`/annonce/${listing.slug}`} className="block font-medium hover:underline">
                  {listing.titre}
                </Link>
                <p className="mt-1 text-sm text-gray-500">{listing.ville}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
