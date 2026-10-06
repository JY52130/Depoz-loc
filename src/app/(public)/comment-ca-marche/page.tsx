import { TitreAvecMalin } from "@/components/Malin";
export const metadata = { title: "Comment ça marche" };

const etapesLocataire = [
  "Cherchez un objet par catégorie, puis affinez par ville, distance, dates et prix.",
  "Consultez la fiche : photos, tarifs, caution, disponibilités et avis sur le propriétaire.",
  "Choisissez vos dates sur le calendrier et réservez. L'objet est bloqué pour vous.",
  "Récupérez l'objet en main propre, chez un commerçant relais ou faites-vous livrer si le propriétaire le propose, après un état des lieux en photos.",
  "Rendez-le à la date prévue. Si tout est en ordre, la caution n'est pas prélevée.",
];

const etapesProprietaire = [
  "Créez votre annonce : catégorie, photos, description et ville.",
  "Fixez vos tarifs à la demi-journée, à la journée, à la semaine ou au mois.",
  "La caution est calculée automatiquement à partir du prix neuf et de l'âge de l'objet.",
  "Indiquez vos disponibilités et le mode de remise : en main propre, chez un commerçant relais, ou en livrant vous-même (à votre prix).",
  "Acceptez les réservations, échangez avec le locataire par la messagerie et recevez vos revenus.",
];

export default function CommentCaMarchePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Comment ça marche" pose="livraison" />
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Vous voulez louer un objet</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
          {etapesLocataire.map((etape) => (
            <li key={etape}>{etape}</li>
          ))}
        </ol>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Vous voulez mettre un objet en location</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
          {etapesProprietaire.map((etape) => (
            <li key={etape}>{etape}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
