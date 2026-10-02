// Texte du contrat de location entre particuliers. Affiché vierge sur la page
// publique /contrat-de-location (modèle consultable avant de réserver) et
// rempli avec les informations de la réservation dans l'espace membre.

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

function date(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
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
  const nbJours = d
    ? Math.max(1, Math.round((d.dateFin.getTime() - d.dateDebut.getTime()) / 86_400_000) + 1)
    : undefined;
  const prixParJour = d && nbJours ? Math.round((d.montantLocation / nbJours) * 100) / 100 : undefined;
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
        lorsqu&apos;ils existent, tels que décrits dans l&apos;annonce. Il est loué
        pour un usage strictement personnel du locataire.
      </p>

      <h2 className="text-lg font-semibold text-black">3. Durée et remise</h2>
      <p>
        La location commence le <Champ valeur={d ? date(d.dateDebut) : undefined} modele="date de début" />{" "}
        et se termine le <Champ valeur={d ? date(d.dateFin) : undefined} modele="date de fin" />. Mode de
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
        n&apos;est pas débitée. Elle ne peut l&apos;être qu&apos;à l&apos;issue de la
        procédure de litige de l&apos;article 11, dans la limite du montant de la
        caution, pour couvrir les sommes dues au titre des articles 8 et 9 (dommages,
        perte, vol, non-restitution, retard, nettoyage).
      </p>
      <p>
        La caution ne couvre pas l&apos;usure normale de l&apos;objet. Si les sommes dues
        dépassent la caution, le propriétaire peut réclamer la différence directement
        au locataire.
      </p>

      <h2 className="text-lg font-semibold text-black">6. Engagements du propriétaire</h2>
      <ul className="list-disc pl-6">
        <li>
          Déclarer être le propriétaire de l&apos;objet, ou avoir le droit de le louer.
        </li>
        <li>
          Remettre un objet conforme à l&apos;annonce, propre, en bon état de marche,
          sans danger et conforme aux normes de sécurité qui s&apos;y appliquent
          (marquage CE pour les appareils et outils concernés).
        </li>
        <li>
          Fournir les accessoires et la notice d&apos;utilisation prévus, expliquer au
          locataire le fonctionnement de l&apos;objet et les précautions à prendre
          (gants, lunettes, protections…).
        </li>
        <li>
          Signaler dans l&apos;annonce ou par la messagerie tout défaut connu de
          l&apos;objet. Si un défaut a été caché, le propriétaire ne peut pas en
          réclamer la réparation au locataire.
        </li>
        <li>Être présent ou joignable aux dates de remise et de retour convenues.</li>
      </ul>
      <p>
        Lors de la remise, le propriétaire peut demander à voir une pièce
        d&apos;identité du locataire, afin de vérifier qu&apos;il s&apos;agit bien de la
        personne qui a réservé.
      </p>

      <h2 className="text-lg font-semibold text-black">7. Engagements du locataire</h2>
      <ul className="list-disc pl-6">
        <li>
          Être majeur et disposer, si l&apos;objet l&apos;exige, des permis,
          habilitations ou compétences nécessaires pour l&apos;utiliser. Si un mineur
          utilise l&apos;objet, le locataire en reste responsable.
        </li>
        <li>
          Vérifier l&apos;objet avec le propriétaire lors de la remise (état,
          fonctionnement, accessoires). En acceptant l&apos;objet sans réserve, le
          locataire reconnaît l&apos;avoir reçu en bon état, sauf défaut caché.
        </li>
        <li>
          Utiliser l&apos;objet avec soin, selon son usage normal, la notice et les
          consignes de sécurité, et le ranger à l&apos;abri pendant la location.
        </li>
        <li>Ne pas prêter ni sous-louer l&apos;objet, ne pas le modifier, et ne pas l&apos;utiliser à des fins illégales.</li>
        <li>Prévenir le propriétaire sans attendre en cas de panne, de dommage, de perte ou de vol.</li>
        <li>
          Rendre l&apos;objet propre, avec tous ses accessoires, au lieu et à la date
          convenus. Les consommables (carburant, piles, cartouches…) ne sont pas compris
          dans le prix, sauf mention contraire dans l&apos;annonce : un objet à moteur
          est rendu avec le même niveau de carburant qu&apos;à la remise.
        </li>
      </ul>
      <p>
        Du moment où il reçoit l&apos;objet jusqu&apos;à sa restitution, le locataire en
        a la garde. Il est responsable des dommages que l&apos;objet pourrait causer à
        lui-même ou à d&apos;autres personnes pendant cette période, sauf si ces
        dommages viennent d&apos;un défaut de l&apos;objet.
      </p>

      <h2 className="text-lg font-semibold text-black">8. Dommages, perte et vol</h2>
      <ul className="list-disc pl-6">
        <li>
          <strong>Objet abîmé et réparable</strong> : le locataire paie la réparation,
          sur présentation d&apos;un devis ou d&apos;une facture d&apos;un réparateur.
        </li>
        <li>
          <strong>Objet irréparable, perdu ou non rendu</strong> : le locataire paie la
          valeur de l&apos;objet au jour du sinistre, compte tenu de son âge et de son
          usure, sur présentation d&apos;une preuve de cette valeur (facture d&apos;achat,
          attestation d&apos;un réparateur, annonce d&apos;un objet équivalent).
        </li>
        <li>
          <strong>Vol</strong> : le locataire porte plainte auprès de la police ou de la
          gendarmerie et transmet une copie de la plainte au propriétaire. Le vol est
          traité comme une perte.
        </li>
        <li>
          <strong>Objet rendu sale</strong> : si un nettoyage particulier est
          nécessaire, au-delà de l&apos;usage normal, il est à la charge du locataire.
        </li>
      </ul>
      <p>
        Les parties cherchent d&apos;abord un accord amiable. À défaut, la procédure de
        litige de l&apos;article 11 s&apos;applique.
      </p>

      <h2 className="text-lg font-semibold text-black">9. Retard</h2>
      <p>
        En cas de retard de restitution, le locataire prévient le propriétaire au plus
        tôt. Chaque jour de retard est dû au propriétaire au prix de{" "}
        <Champ valeur={prixParJour !== undefined ? euros(prixParJour) : undefined} modele="prix moyen d'une journée de cette location" />{" "}
        par jour, sauf accord entre les parties pour prolonger la location par le site.
      </p>

      <h2 className="text-lg font-semibold text-black">10. États des lieux</h2>
      <p>
        À la remise et au retour, les parties vérifient l&apos;objet ensemble et
        chacune peut déposer sur le site un état des lieux avec photos et remarques.
        L&apos;état des lieux d&apos;entrée est possible une fois le contrat accepté par
        les deux parties. Ces états des lieux servent de preuve de l&apos;état de
        l&apos;objet en cas de désaccord : prenez des photos nettes, sous plusieurs
        angles, et testez le fonctionnement de l&apos;objet devant l&apos;autre partie.
      </p>

      <h2 className="text-lg font-semibold text-black">11. Litige</h2>
      <p>
        En cas de désaccord, chaque partie peut ouvrir un litige depuis la page de la
        réservation, entre la remise et la clôture de la location. Dépôt Malin examine
        les états des lieux, les photos, les justificatifs (devis, factures, plainte)
        et les messages échangés, et propose une solution. Si aucun accord amiable
        n&apos;est trouvé, les parties restent libres de saisir le tribunal compétent.
      </p>
      <p>
        Le présent contrat est un contrat de location de chose (articles 1709 et
        suivants du Code civil), soumis au droit français.
      </p>

      <h2 className="text-lg font-semibold text-black">12. Assurance</h2>
      <p>
        Dépôt Malin n&apos;assure pas les objets loués. Chaque partie vérifie auprès de
        son assureur que son assurance habitation (responsabilité civile) couvre la
        location d&apos;objets entre particuliers. Attention : cette assurance ne
        couvre pas toujours les dommages causés à un objet loué, ni son vol.
      </p>

      <h2 className="text-lg font-semibold text-black">13. Acceptation</h2>
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
