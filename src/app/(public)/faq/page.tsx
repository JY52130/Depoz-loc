import { JsonLd } from "@/components/JsonLd";
import { TitreAvecMalin } from "@/components/Malin";

export const metadata = { title: "FAQ" };

const QUESTIONS = [
  {
    question: "Comment fonctionne la caution ?",
    reponse:
      "Elle est calculée automatiquement à partir du prix neuf estimé de l'objet et de son âge. Votre carte est enregistrée à la réservation (via Stripe) mais n'est débitée qu'en cas de dommage constaté à l'état des lieux de retour.",
  },
  {
    question: "Comment récupère-t-on l'objet loué ?",
    reponse:
      "Selon l'annonce, soit en main à main directement avec le propriétaire (modalités à convenir via la messagerie interne), soit chez un commerçant relais partenaire, soit livré chez vous par le propriétaire s'il le propose (prix indiqué sur l'annonce). Dépôt Malin ne transporte rien lui-même.",
  },
  {
    question: "Quels sont les frais ?",
    reponse:
      "10 % du montant de la location (1 € minimum) sont ajoutés au paiement du locataire, et 15 % sont prélevés sur le reversement au propriétaire (10 % avec l'abonnement Pro). Le passage par un commerçant relais ajoute 5 € à la charge du locataire. Si le propriétaire livre, le locataire paie le prix de livraison qu'il a fixé, et Dépôt Malin garde 10 % (0,50 € minimum) de ce prix.",
  },
  {
    question: "Que se passe-t-il en cas de litige ou de dommage ?",
    reponse:
      "Vous pouvez signaler un problème directement depuis votre réservation. Notre équipe traite chaque litige individuellement, par email, et peut retenir tout ou partie de la caution selon les éléments transmis.",
  },
  {
    question: "Puis-je louer et mettre en location en tant que professionnel ?",
    reponse:
      "Oui, un compte unique suffit : le statut particulier ou professionnel se choisit lors de votre première mise en location (SIRET requis pour les professionnels). Les professionnels peuvent aussi prendre l'abonnement Pro, depuis leur espace membre, pour des annonces sans limite de durée et une commission réduite.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUESTIONS.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.reponse },
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd data={faqJsonLd} />
      <TitreAvecMalin titre="Foire aux questions" pose="assistance" />
      <div className="mt-6 flex flex-col gap-6">
        {QUESTIONS.map((q) => (
          <div key={q.question}>
            <h2 className="font-medium">{q.question}</h2>
            <p className="mt-1 text-gray-600">{q.reponse}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
