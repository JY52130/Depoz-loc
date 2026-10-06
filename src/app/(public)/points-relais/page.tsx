import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";
import { TitreAvecMalin } from "@/components/Malin";

export const metadata = { title: "Commerçants relais" };

export const revalidate = 3600;

export default async function PointsRelaisPage() {
  // Base injoignable au build : liste vide, rafraîchie ensuite par l'ISR.
  const points = await prisma.relayPoint
    .findMany({ where: { actif: true }, orderBy: [{ ville: "asc" }, { nom: "asc" }] })
    .catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Nos commerçants relais" pose="stockage" />
      <p className="mt-4 text-gray-600">
        Des commerces partenaires près de chez vous gardent l&apos;objet
        loué : le propriétaire l&apos;y dépose, le locataire vient le
        retirer puis le rapporte au même endroit. Pratique quand vous
        n&apos;êtes pas disponibles aux mêmes heures. Ce service coûte 5 €
        par location, payés par le locataire.
      </p>

      {points.length === 0 ? (
        <p className="mt-6 text-gray-600">Les premiers commerçants relais arrivent bientôt à Saint-Dizier et dans ses alentours.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {points.map((point) => {
            const localBusinessJsonLd = {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: point.nom,
              address: {
                "@type": "PostalAddress",
                streetAddress: point.adresse,
                postalCode: point.codePostal,
                addressLocality: point.ville,
                addressCountry: "FR",
              },
              ...(point.latitude != null && point.longitude != null
                ? { geo: { "@type": "GeoCoordinates", latitude: point.latitude, longitude: point.longitude } }
                : {}),
              url: siteUrl,
            };

            return (
              <li key={point.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <JsonLd data={localBusinessJsonLd} />
                <h2 className="font-medium">{point.nom}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {point.adresse}, {point.codePostal} {point.ville}
                </p>
                {point.horaires && <p className="mt-1 text-sm text-gray-500">{point.horaires}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
