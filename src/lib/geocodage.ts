// Géocodage adresse -> lat/lng (section 11.2), limité à la France métropolitaine.
// Utilise l'API Adresse du gouvernement français (api-adresse.data.gouv.fr),
// gratuite et sans clé — bien adaptée au périmètre "France métropolitaine uniquement".

export type ResultatGeocodage = {
  latitude: number;
  longitude: number;
  ville: string;
  codePostal: string;
} | null;

export async function geocoderAdresse(requete: string): Promise<ResultatGeocodage> {
  const trimmed = requete.trim();
  if (!trimmed) return null;

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmed)}&limit=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as {
      features?: {
        geometry: { coordinates: [number, number] };
        properties: { city?: string; postcode?: string };
      }[];
    };

    const feature = data.features?.[0];
    if (!feature) return null;

    const [longitude, latitude] = feature.geometry.coordinates;
    return {
      latitude,
      longitude,
      ville: feature.properties.city ?? "",
      codePostal: feature.properties.postcode ?? "",
    };
  } catch {
    return null;
  }
}
