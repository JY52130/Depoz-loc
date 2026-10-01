import { AvertissementJuridique } from "@/components/AvertissementJuridique";

export const metadata = { title: "Conditions générales de vente" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Conditions générales de vente</h1>
      <AvertissementJuridique />

      <div className="flex flex-col gap-4 text-gray-700">
        <h2 className="text-lg font-semibold text-black">1. Prix et commissions</h2>
        <p>
          Le locataire paie le montant de la location choisie (tarif par
          palier le plus avantageux pour la durée demandée) majoré de 5 % de
          frais de service. Le propriétaire perçoit ce montant diminué
          d&apos;une commission de 10 %, une fois la location clôturée. Un
          forfait supplémentaire s&apos;applique lorsque la remise transite
          par un point relais, à la charge du locataire.
        </p>

        <h2 className="text-lg font-semibold text-black">2. Caution</h2>
        <p>
          Une caution est calculée automatiquement à partir du prix neuf
          estimé de l&apos;objet et de son âge déclaré. Elle n&apos;est pas
          débitée à la réservation : votre moyen de paiement est simplement
          enregistré (Stripe), et ne sera débité qu&apos;en cas de dommage
          constaté et de litige résolu en ce sens.
        </p>

        <h2 className="text-lg font-semibold text-black">3. Paiement et séquestre</h2>
        <p>
          Les paiements sont traités par Stripe Connect. Les fonds sont
          encaissés par Dépôt Malin et reversés au propriétaire (net de
          commission) après validation du retour de l&apos;objet
          (« clôture »), selon une cadence hebdomadaire.
        </p>

        <h2 className="text-lg font-semibold text-black">4. Annulation</h2>
        <p>
          Les conditions d&apos;annulation et de remboursement seront
          précisées ultérieurement (fonctionnalité en cours de
          développement).
        </p>

        <h2 className="text-lg font-semibold text-black">5. Litiges et retenue de caution</h2>
        <p>
          En cas de dommage, tout membre peut signaler un litige depuis sa
          réservation. Notre équipe examine chaque situation par email et
          peut décider de retenir tout ou partie de la caution enregistrée,
          reversée au propriétaire en compensation.
        </p>

        <h2 className="text-lg font-semibold text-black">6. Facturation</h2>
        <p>
          Un reçu simple est fourni aux particuliers ; les professionnels
          reçoivent une facture conforme incluant leur SIRET.
        </p>
      </div>
    </article>
  );
}
