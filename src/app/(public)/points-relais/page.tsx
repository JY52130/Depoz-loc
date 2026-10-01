import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";

export const metadata = { title: "Nos points relais" };

export const revalidate = 3600;

export default async function PointsRelaisPage() {
  // Base injoignable au build : liste vide, rafraîchie ensuite par l'ISR.
  const points = await prisma.relayPoint.findMany().catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Nos points relais</h1>
      <p className="mt-4 text-gray-600">
        Le circuit point relais (click &amp; collect) permet de déposer et
        retirer un objet loué sans contact direct entre propriétaire et
        locataire.
      </p>

      {points.length === 0 ? (
        <p className="mt-6 text-gray-600">Aucun point relais renseigné pour le moment.</p>
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
              <li key={point.id} className="rounded border p-4">
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
