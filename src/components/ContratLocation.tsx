// Texte du contrat de location entre particuliers. Affiché vierge sur la page
// publique /contrat-de-location (modèle consultable avant de réserver) et
// rempli avec les informations de la réservation dans l'espace membre.

import { libellePeriode } from "@/lib/periodeLocation";

export type DonneesContrat = {
  proprietaire: { nom: string | null; email: string };
  locataire: { nom: string | null; email: string };
  objet: { titre: string; description: string; ville: string | null; prixNeufEstime: number | null };
  dateDebut: Date;
  dateFin: Date;
  modeRemise: string;
  montantLocation: number;
  fraisServiceLocataire: number;
  fraisPointRelais: number | null;
  commissionProprietaire: number;
  montantCaution: number;
  contratAccepteProprietaireLe: Date | null;
  contratAccepteLocataireLe: Date | null;
};

const LABELS_REMISE: Record<string, string> = {
  P2P: "remise en main propre entre les parties",
  POINT_RELAIS: "remise et retour au point relais Dépôt Malin",
};

function euros(montant: number): string {
  return montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function dateHeure(d: Date): string {
  return d.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function Champ({ valeur, modele }: { valeur: string | undefined; modele: string }) {
  return valeur ? <strong>{valeur}</strong> : <em>[{modele}]</em>;
}

export function ContratLocation({ donnees }: { donnees?: DonneesContrat }) {
  const d = donnees;
  const nomProprietaire = d ? d.proprietaire.nom || d.proprietaire.email : undefined;
  const nomLocataire = d ? d.locataire.nom || d.locataire.email : undefined;
  const totalLocataire = d
    ? d.montantLocation + d.fraisServiceLocataire + (d.fraisPointRelais ?? 0)
    : undefined;

  return (
    <div className="flex flex-col gap-4 text-gray-700">
      <h2 className="text-lg font-semibold text-black">1. Les parties</h2>
      <p>
        Le présent contrat est conclu entre le propriétaire de l&apos;objet,{" "}
        <Champ valeur={nomProprietaire} modele="nom du propriétaire" />, ci-après
        « le propriétaire », et <Champ valeur={nomLocataire} modele="nom du locataire" />,
        ci-après « le locataire ».
      </p>
      <p>
        Dépôt Malin met les parties en relation et gère le paiement et la caution.
        Dépôt Malin n&apos;est pas partie au contrat de location : il n&apos;est ni
        propriétaire, ni loueur de l&apos;objet.
      </p>

      <h2 className="text-lg font-semibold text-black">2. L&apos;objet loué</h2>
      <p>
        Objet : <Champ valeur={d?.objet.titre} modele="nom de l'objet" />
        {d?.objet.ville && <>, situé à {d.objet.ville}</>}.
        {d?.objet.prixNeufEstime ? (
          <> Valeur à neuf déclarée par le propriétaire : {euros(d.objet.prixNeufEstime)}.</>
        ) : null}
      </p>
      {d && <p className="whitespace-pre-line">Description de l&apos;annonce : {d.objet.description}</p>}
      <p>
        L&apos;objet est remis avec ses accessoires et sa notice d&apos;utilisation
        lorsqu&apos;ils existent, tels que décrits dans l&apos;annonce.
      </p>

      <h2 className="text-lg font-semibold text-black">3. Durée et remise</h2>
      <p>
        La location a lieu{" "}
        <Champ valeur={d ? libellePeriode(d.dateDebut, d.dateFin) : undefined} modele="du … au …, à la demi-journée, à la journée ou à la semaine" />. Mode de
        remise : <Champ valeur={d ? LABELS_REMISE[d.modeRemise] ?? d.modeRemise : undefined} modele="main à main ou point relais" />.
        Le lieu et l&apos;heure de remise et de retour sont convenus entre les parties
        par la messagerie du site.
      </p>

      <h2 className="text-lg font-semibold text-black">4. Prix</h2>
      <p>
        Prix de la location : <Champ valeur={d ? euros(d.montantLocation) : undefined} modele="montant" />.
        Le locataire paie en plus des frais de service de{" "}
        <Champ valeur={d ? euros(d.fraisServiceLocataire) : undefined} modele="10 %, 1 € minimum" />
        {d?.fraisPointRelais ? <> et des frais de point relais de {euros(d.fraisPointRelais)}</> : null},
        soit un total de <Champ valeur={totalLocataire !== undefined ? euros(totalLocataire) : undefined} modele="total" />,
        payé en ligne à la réservation.
      </p>
      <p>
        Le propriétaire reçoit le prix de la location diminué de la commission de
        Dépôt Malin (<Champ valeur={d ? euros(d.commissionProprietaire) : undefined} modele="15 %" />),
        après la fin de la location et la confirmation du retour de l&apos;objet.
      </p>

      <h2 className="text-lg font-semibold text-black">5. Caution</h2>
      <p>
        Montant de la caution : <Champ valeur={d ? euros(d.montantCaution) : undefined} modele="montant" />.
        La carte bancaire du locataire est enregistrée à la réservation mais
        n&apos;est pas débitée. Elle ne peut l&apos;être qu&apos;en cas de dommage, de
        perte ou de non-restitution de l&apos;objet, constaté après la procédure de
        litige de l&apos;article 9, et dans la limite du montant de la caution.
      </p>

      <h2 className="text-lg font-semibold text-black">6. Engagements du propriétaire</h2>
      <ul className="list-disc pl-6">
        <li>Remettre un objet conforme à l&apos;annonce, propre, en bon état de marche et sans danger.</li>
        <li>Être le propriétaire de l&apos;objet ou avoir le droit de le louer.</li>
        <li>Expliquer au locataire comment utiliser l&apos;objet et les précautions à prendre.</li>
        <li>Être présent ou joignable aux dates de remise et de retour convenues.</li>
      </ul>

      <h2 className="text-lg font-semibold text-black">7. Engagements du locataire</h2>
      <ul className="list-disc pl-6">
        <li>Utiliser l&apos;objet avec soin, selon son usage normal et la notice.</li>
        <li>Ne pas prêter ni sous-louer l&apos;objet, et ne pas le modifier.</li>
        <li>Prévenir le propriétaire sans attendre en cas de panne, de dommage, de perte ou de vol.</li>
        <li>
          Rendre l&apos;objet propre, avec ses accessoires, à la date prévue. En cas de
          retard, prévenir le propriétaire au plus tôt.
        </li>
        <li>
          Répondre des dommages, de la perte ou du vol survenus pendant la location,
          sauf usure normale ou défaut de l&apos;objet existant avant la remise.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-black">8. États des lieux</h2>
      <p>
        À la remise et au retour, chaque partie peut déposer sur le site un état des
        lieux avec photos et remarques. Ces états des lieux servent de preuve de
        l&apos;état de l&apos;objet en cas de désaccord. Les parties sont invitées à
        prendre des photos nettes de l&apos;objet sous plusieurs angles.
      </p>

      <h2 className="text-lg font-semibold text-black">9. Litige</h2>
      <p>
        En cas de désaccord, chaque partie peut ouvrir un litige depuis la page de la
        réservation, entre la remise et la clôture de la location. Dépôt Malin examine
        les états des lieux, les photos et les messages échangés, et propose une
        solution. Si aucun accord amiable n&apos;est trouvé, les parties restent libres
        de saisir le tribunal compétent. Le présent contrat est soumis au droit
        français.
      </p>

      <h2 className="text-lg font-semibold text-black">10. Assurance</h2>
      <p>
        Dépôt Malin n&apos;assure pas les objets loués. Chaque partie est invitée à
        vérifier auprès de son assureur que son assurance responsabilité civile
        couvre la location ou l&apos;emprunt d&apos;objets entre particuliers.
      </p>

      <h2 className="text-lg font-semibold text-black">11. Acceptation</h2>
      <p>
        Le contrat est accepté en ligne par chaque partie, en cochant la case prévue
        ou en cliquant sur le bouton d&apos;acceptation. La date et l&apos;heure de
        chaque acceptation sont enregistrées et valent signature du présent contrat.
        Les conditions générales d&apos;utilisation et de vente du site s&apos;appliquent
        également.
      </p>
      {d && (
        <ul className="list-disc pl-6">
          <li>
            Propriétaire :{" "}
            {d.contratAccepteProprietaireLe
              ? `accepté le ${dateHeure(d.contratAccepteProprietaireLe)}`
              : "pas encore accepté"}
          </li>
          <li>
            Locataire :{" "}
            {d.contratAccepteLocataireLe
              ? `accepté le ${dateHeure(d.contratAccepteLocataireLe)}`
              : "pas encore accepté"}
          </li>
        </ul>
      )}
    </div>
  );
}
