import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { ReserverForm } from "@/components/ReserverForm";
import { AdSlot } from "@/components/AdSlot";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ erreur?: string }>;
};

async function getListing(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      proprietaire: { select: { nom: true, noteMoyenne: true, statut: true } },
      availabilities: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Annonce introuvable" };

  return {
    title: listing.titre,
    description: listing.description.slice(0, 160),
    openGraph: {
      images: listing.photos.slice(0, 1),
    },
  };
}

const LABELS_REMISE: Record<string, string> = {
  P2P: "Main à main",
  POINT_RELAIS: "Point relais",
};

export default async function AnnoncePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { erreur } = await searchParams;
  const listing = await getListing(slug);

  if (!listing || listing.statut !== "EN_LIGNE") {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depozloc.fr";
  const prixAffiche = listing.prixJournee ?? listing.prixDemiJournee ?? listing.prixSemaine ?? listing.prixMois;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: listing.category.nom,
        item: `${siteUrl}/location/${listing.category.slug}`,
      },
      { "@type": "ListItem", position: 3, name: listing.titre, item: `${siteUrl}/annonce/${listing.slug}` },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.titre,
    description: listing.description,
    image: listing.photos,
    category: listing.category.nom,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/annonce/${listing.slug}`,
      priceCurrency: "EUR",
      price: prixAffiche ? Number(prixAffiche) : undefined,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={productJsonLd} />

      <nav className="text-sm text-gray-500">
        <a href={`/location/${listing.category.slug}`} className="hover:underline">
          {listing.category.nom}
        </a>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {listing.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {listing.photos.map((url: string) => (
                <div key={url} className="relative aspect-square w-full overflow-hidden rounded">
                  <Image
                    src={url}
                    alt={listing.titre}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded bg-gray-100 text-gray-400">
              Aucune photo
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{listing.titre}</h1>
          <p className="mt-2 text-gray-600">{listing.description}</p>

          <div className="mt-6 rounded border p-4">
            <h2 className="font-medium">Tarifs</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {listing.prixDemiJournee != null && <li>Demi-journée : {listing.prixDemiJournee.toString()} €</li>}
              {listing.prixJournee != null && <li>Journée : {listing.prixJournee.toString()} €</li>}
              {listing.prixSemaine != null && <li>Semaine : {listing.prixSemaine.toString()} €</li>}
              {listing.prixMois != null && <li>Mois : {listing.prixMois.toString()} €</li>}
            </ul>
            <p className="mt-3 text-sm text-gray-700">
              Caution demandée : <strong>{listing.montantCaution?.toString()} €</strong>
            </p>
          </div>

          <div className="mt-4 rounded border p-4">
            <h2 className="font-medium">Mode(s) de remise</h2>
            <ul className="mt-2 text-sm text-gray-700">
              {listing.modesRemise.map((mode) => (
                <li key={mode}>{LABELS_REMISE[mode] ?? mode}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded border p-4">
            <h2 className="font-medium">Propriétaire</h2>
            <p className="mt-2 text-sm text-gray-700">
              {listing.proprietaire.nom ?? "Membre DepozLoc"}
              {listing.proprietaire.statut === "PRO" && " · Professionnel"}
              {listing.proprietaire.noteMoyenne != null && ` · Note ${listing.proprietaire.noteMoyenne}/5`}
            </p>
          </div>

          {erreur && (
            <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}

          <ReserverForm
            listingId={listing.id}
            slug={listing.slug}
            modesRemise={listing.modesRemise}
            tarifs={{
              demiJournee: listing.prixDemiJournee != null ? Number(listing.prixDemiJournee) : undefined,
              journee: listing.prixJournee != null ? Number(listing.prixJournee) : undefined,
              semaine: listing.prixSemaine != null ? Number(listing.prixSemaine) : undefined,
              mois: listing.prixMois != null ? Number(listing.prixMois) : undefined,
            }}
          />

          <AdSlot slot="3234567890" />
        </div>
      </div>
    </main>
  );
}
