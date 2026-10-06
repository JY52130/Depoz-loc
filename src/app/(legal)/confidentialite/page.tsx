import { AvertissementJuridique } from "@/components/AvertissementJuridique";

export const metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
      <AvertissementJuridique />

      <div className="flex flex-col gap-4 text-gray-700">
        <p>
          Dépôt Malin (« nous ») accorde une grande importance à la protection
          de vos données personnelles. Cette politique décrit les données
          collectées, leurs finalités, leur durée de conservation et vos
          droits, conformément au Règlement Général sur la Protection des
          Données (RGPD).
        </p>

        <h2 className="text-lg font-semibold text-black">Données collectées</h2>
        <p>
          Identité et contact (nom, email, téléphone), données de profil
          (statut particulier/professionnel, SIRET le cas échéant), données
          de localisation des annonces, contenus déposés (photos, messages,
          avis), données de paiement traitées exclusivement par notre
          prestataire Stripe (nous ne stockons aucun numéro de carte).
        </p>
        <p>
          Vérification d&apos;identité (facultative, badge « Identité
          vérifiée ») : la photo de votre pièce d&apos;identité et votre selfie
          sont collectés et analysés directement par Stripe (service Stripe
          Identity), avec votre accord donné au moment de la vérification.
          Dépôt Malin ne reçoit pas ces images ; nous conservons seulement
          le résultat (vérifié ou non) et sa date.
        </p>

        <h2 className="text-lg font-semibold text-black">Finalités</h2>
        <p>
          Gestion du compte et de l&apos;authentification, mise en relation
          propriétaires/locataires, traitement des paiements et cautions,
          prévention de la fraude, support et gestion des litiges, mesure
          d&apos;audience et publicité (sous réserve de votre consentement),
          respect de nos obligations légales et comptables.
        </p>

        <h2 className="text-lg font-semibold text-black">Destinataires et sous-traitants</h2>
        <p>
          Vos données peuvent être transmises à nos prestataires techniques :
          Supabase (hébergement base de données et authentification), Stripe
          (paiements, Stripe Connect et vérification d&apos;identité), Resend (emails transactionnels),
          Anthropic (estimation du prix neuf pour la caution), et Google
          AdSense (publicité, uniquement après consentement).
        </p>

        <h2 className="text-lg font-semibold text-black">Durée de conservation</h2>
        <p>
          Les données de compte sont conservées pendant la durée de la
          relation contractuelle puis archivées conformément aux obligations
          légales (notamment comptables). Les données de paiement sont
          conservées par Stripe selon sa propre politique.
        </p>

        <h2 className="text-lg font-semibold text-black">Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification, d&apos;effacement, de limitation, d&apos;opposition
          et de portabilité de vos données. Pour exercer ces droits,
          contactez-nous via la page{" "}
          <a href="/contact" className="underline">Contact</a>.
        </p>

        <h2 className="text-lg font-semibold text-black">Sécurité</h2>
        <p>
          Les mots de passe sont gérés par Supabase Auth (hachés), l&apos;accès
          aux données sensibles est restreint par rôle, et aucun numéro de
          carte bancaire n&apos;est stocké sur nos serveurs (délégation
          intégrale à Stripe).
        </p>
      </div>
    </article>
  );
}
