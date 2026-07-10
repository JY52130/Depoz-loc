import { AvertissementJuridique } from "@/components/AvertissementJuridique";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Conditions générales d&apos;utilisation</h1>
      <AvertissementJuridique />

      <div className="flex flex-col gap-4 text-gray-700">
        <h2 className="text-lg font-semibold text-black">1. Objet</h2>
        <p>
          DepozLoc est une plateforme de mise en relation entre particuliers
          et professionnels en vue de la location d&apos;objets, en France
          métropolitaine. DepozLoc agit en tant qu&apos;intermédiaire
          technique et n&apos;est ni propriétaire ni locataire des objets mis
          en location.
        </p>

        <h2 className="text-lg font-semibold text-black">2. Compte membre</h2>
        <p>
          L&apos;inscription se fait par email et mot de passe. Un même
          compte peut être à la fois propriétaire et locataire. Le statut
          particulier ou professionnel se choisit lors de la première mise
          en location ; les professionnels doivent renseigner un SIRET
          valide.
        </p>

        <h2 className="text-lg font-semibold text-black">3. Rôle d&apos;intermédiaire</h2>
        <p>
          DepozLoc met à disposition les outils de réservation, de paiement
          (via Stripe Connect) et de communication entre membres, mais
          n&apos;intervient pas dans la remise physique des objets (hors
          circuit point relais) ni dans leur bon usage. La responsabilité de
          l&apos;état, de l&apos;usage et de la restitution de l&apos;objet
          loué incombe aux parties à la location.
        </p>

        <h2 className="text-lg font-semibold text-black">4. Obligations des membres</h2>
        <p>
          Chaque membre s&apos;engage à fournir des informations exactes
          (notamment sur le prix neuf et l&apos;âge du matériel mis en
          location, via une attestation sur l&apos;honneur), à respecter les
          modalités de réservation et de remise convenues, et à signaler tout
          dommage ou litige via l&apos;outil dédié.
        </p>

        <h2 className="text-lg font-semibold text-black">5. Modération</h2>
        <p>
          Toute annonce est soumise à modération avant publication. DepozLoc
          se réserve le droit de refuser, suspendre ou retirer une annonce ou
          un compte en cas de non-respect des présentes conditions.
        </p>

        <h2 className="text-lg font-semibold text-black">6. Litiges</h2>
        <p>
          En V1, les litiges sont traités individuellement par notre équipe,
          par email, et peuvent donner lieu à une retenue de tout ou partie
          de la caution (voir Conditions générales de vente).
        </p>
      </div>
    </article>
  );
}
