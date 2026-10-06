import { FRAIS_POINT_RELAIS } from "@/lib/constantesReservation";
import { JOURS_GRATUITS, JOURS_PROLONGATION, PRIX_PROLONGATION } from "@/lib/dureeAnnonce";
import { JOURS_MISE_EN_AVANT } from "@/lib/miseEnAvant";
import { PRIX_ABONNEMENT_PRO } from "@/lib/abonnementPro";

export const metadata = { title: "Tarifs & commissions" };

export default function TarifsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Tarifs & commissions</h1>
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
          Frais point relais (optionnel) : {FRAIS_POINT_RELAIS} € par location,
          à la charge du locataire.
        </li>
      </ul>
    </main>
  );
}
