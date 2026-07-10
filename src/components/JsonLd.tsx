// Helper réutilisable pour injecter des données structurées schema.org (section 12.2).
// Usage : <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", ... }} />
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
