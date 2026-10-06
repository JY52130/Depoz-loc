import { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";
import { COMMISSION_LIVRAISON_MINIMUM, TAUX_COMMISSION_LIVRAISON } from "@/lib/livraison";
import { JOURS_GRATUITS, JOURS_PROLONGATION, PRIX_PROLONGATION } from "@/lib/dureeAnnonce";
import { JOURS_MISE_EN_AVANT } from "@/lib/miseEnAvant";
import { PRIX_ABONNEMENT_PRO } from "@/lib/abonnementPro";
import { PRIX_VERIFICATION_IDENTITE } from "@/lib/verificationIdentite";
import { TitreAvecMalin } from "@/components/Malin";

export const metadata = { title: "Tarifs & commissions" };

export default function TarifsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Tarifs & commissions" pose="promotion" />
      <ul className="mt-6 space-y-2 text-gray-700">
        <li>Frais de service locataire : 10 % du montant de la location (1 € minimum).</li>
        <li>Commission propriétaire : 15 % du montant de la location.</li>
        <li>
          Inscription et publication d&apos;annonces : gratuites. Chaque annonce
          est en ligne gratuitement {JOURS_GRATUITS} jours.
        </li>
        <li>
          Prolongation d&apos;une annonce : {PRIX_PROLONGATION} € pour {JOURS_PROLONGATION} jours,
          gratuite si l&apos;objet a déjà été loué.
        </li>
        <li>
          Annonce « À la une » pendant {JOURS_MISE_EN_AVANT} jours (option) : 2 € si l&apos;objet se loue
          jusqu&apos;à 10 € par jour, 4 € de 10 à 30 € par jour, 6 € au-delà.
        </li>
        <li>
          Abonnement Pro (professionnels) :{" "}
          {PRIX_ABONNEMENT_PRO.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € par mois, sans
          engagement. Annonces sans limite de durée, commission propriétaire de 10 % au lieu de 15 %, badge
          « Pro » et une mise « À la une » offerte tous les 30 jours.
        </li>
        <li>
          Badge « Identité vérifiée » (option) :{" "}
          {PRIX_VERIFICATION_IDENTITE.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € une seule fois,
          offert aux membres Pro.
        </li>
        <li>
          Commerçant relais (optionnel) : {FRAIS_POINT_RELAIS} € par location,
          à la charge du locataire.
        </li>
        <li>
          Livraison par le propriétaire (optionnel) : prix fixé par le propriétaire pour l&apos;aller-retour,
          payé par le locataire. Commission Dépôt Malin : {TAUX_COMMISSION_LIVRAISON * 100} % (
          {COMMISSION_LIVRAISON_MINIMUM.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € minimum), prélevée
          sur le montant reversé au propriétaire.
        </li>
      </ul>
    </main>
  );
}
