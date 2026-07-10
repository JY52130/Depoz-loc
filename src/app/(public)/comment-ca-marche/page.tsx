export const metadata = { title: "Comment ça marche" };

export default function CommentCaMarchePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Comment ça marche</h1>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Côté locataire</h2>
        <p className="mt-2 text-gray-600">
          Recherche → fiche annonce → réservation des dates → paiement et
          caution → récupération en main propre ou en point relais.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Côté propriétaire</h2>
        <p className="mt-2 text-gray-600">
          Mise en location → tarifs par palier → caution auto-calculée →
          choix du mode de remise → réception des demandes et paiement via
          Stripe Connect.
        </p>
      </section>
    </main>
  );
}
