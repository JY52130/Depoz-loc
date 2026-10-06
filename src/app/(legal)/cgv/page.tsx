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
          palier le plus avantageux pour la durée demandée) majoré de 10 % de
          frais de service (1 € minimum). Le propriétaire perçoit ce montant diminué
          d&apos;une commission de 15 % (10 % pour les membres ayant un
          abonnement Pro en cours), une fois la location clôturée. Un
          forfait supplémentaire s&apos;applique lorsque la remise se fait
          chez un commerçant relais, à la charge du locataire. Lorsque le
          propriétaire propose la livraison, son prix (aller-retour) est
          payé par le locataire avec la location ; le propriétaire le perçoit
          diminué d&apos;une commission de 10 % (0,50 € minimum). Dépôt Malin
          n&apos;assure aucun transport.
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

        <h2 className="text-lg font-semibold text-black">6. Durée de mise en ligne des annonces</h2>
        <p>
          Publier une annonce est gratuit. Après validation par notre équipe,
          l&apos;annonce reste visible gratuitement pendant 15 jours. Le
          propriétaire est prévenu par e-mail 3 jours avant la fin.
        </p>
        <p>
          Il peut ensuite la prolonger de 30 jours pour 2 € TTC, payés par carte
          bancaire, autant de fois qu&apos;il le souhaite. La prolongation est
          gratuite si l&apos;objet a déjà été loué par le site. Sans
          prolongation, l&apos;annonce est simplement masquée : elle n&apos;est
          pas supprimée et peut être prolongée plus tard. Les membres Pro ne
          sont pas concernés par cette limite. La somme payée pour une
          prolongation n&apos;est pas remboursable, sauf si l&apos;annonce est
          retirée par Dépôt Malin sans faute du propriétaire.
        </p>

        <h2 className="text-lg font-semibold text-black">7. Annonce mise en avant</h2>
        <p>
          Le propriétaire peut payer pour mettre son annonce « À la une »
          pendant 7 jours : elle apparaît alors en tête des résultats de
          recherche et de sa catégorie, avec un badge, et sur la page
          d&apos;accueil. Le prix dépend du prix de location à la journée de
          l&apos;objet : 2 € TTC jusqu&apos;à 10 € par jour, 4 € TTC de 10 à
          30 € par jour, 6 € TTC au-delà. Une annonce à la une reste en ligne
          au moins jusqu&apos;à la fin de cette période. La mise en avant ne
          garantit pas de location et n&apos;est pas remboursable, sauf si
          l&apos;annonce est retirée par Dépôt Malin sans faute du
          propriétaire.
        </p>

        <h2 className="text-lg font-semibold text-black">8. Abonnement Pro</h2>
        <p>
          Les professionnels (numéro SIRET valide) peuvent souscrire un
          abonnement Pro à 14,90 € TTC par mois, payé par carte bancaire et
          renouvelé automatiquement chaque mois. Tant qu&apos;il est en cours,
          il donne droit à : des annonces en ligne sans limite de durée, une
          commission propriétaire de 10 % au lieu de 15 % sur les réservations
          faites pendant l&apos;abonnement, un badge « Pro » avec le nom de
          l&apos;entreprise, une mise « À la une » de 7 jours offerte tous
          les 30 jours, et le badge « Identité vérifiée » offert. L&apos;abonnement est sans engagement : il peut être
          résilié à tout moment depuis l&apos;espace membre et s&apos;arrête à
          la fin du mois déjà payé, sans remboursement du mois en cours. À la
          fin de l&apos;abonnement, les annonces repartent pour 15 jours
          gratuits.
        </p>

        <h2 className="text-lg font-semibold text-black">9. Badge « Identité vérifiée »</h2>
        <p>
          Tout membre peut faire vérifier son identité pour afficher le badge
          « Identité vérifiée » sur ses annonces. Le service coûte 2,99 € TTC,
          payé une seule fois par carte bancaire, et il est offert aux membres
          ayant un abonnement Pro en cours. La vérification (pièce
          d&apos;identité et selfie) est réalisée par notre prestataire Stripe ;
          Dépôt Malin ne conserve pas la copie de la pièce d&apos;identité,
          seulement la date de la vérification. Si la vérification échoue, le
          membre peut la recommencer sans payer à nouveau. Le badge atteste
          uniquement que l&apos;identité a été contrôlée : il ne garantit pas
          le comportement du membre. La somme payée n&apos;est pas remboursable
          une fois la vérification commencée.
        </p>

        <h2 className="text-lg font-semibold text-black">10. Facturation</h2>
        <p>
          Un reçu simple est fourni aux particuliers ; les professionnels
          reçoivent une facture conforme incluant leur SIRET.
        </p>
      </div>
    </article>
  );
}
