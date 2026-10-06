import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { estProActif } from "@/lib/abonnementPro";
import {
  LIBELLES_STATUT_VERIFICATION,
  PRIX_VERIFICATION_IDENTITE,
  estIdentiteVerifiee,
  peutLancerVerification,
} from "@/lib/verificationIdentite";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { lancerVerificationIdentite, payerVerificationIdentite } from "./actions";

export const metadata = { title: "Identité vérifiée" };

type Props = { searchParams: Promise<{ paye?: string; retour?: string; erreur?: string }> };

const prix = PRIX_VERIFICATION_IDENTITE.toLocaleString("fr-FR", { minimumFractionDigits: 2 });
const bouton = "rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark";

function dateLongue(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

export default async function VerificationIdentitePage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getOrCreateUser();
  const proActif = estProActif(user);
  const verifiee = estIdentiteVerifiee(user);
  const peutLancer = user ? peutLancerVerification(user, proActif) : false;
  const statut = user?.statutVerificationIdentite ?? null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Badge « Identité vérifiée »</h1>

      {params.paye && !verifiee && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Merci ! Votre paiement est reçu. Vous pouvez maintenant lancer la vérification (rechargez la page si le
          bouton n&apos;apparaît pas encore).
        </p>
      )}
      {params.retour && !verifiee && statut !== "requires_input" && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Merci ! Vos documents sont envoyés. Le résultat arrive en général en quelques minutes : rechargez la page
          pour le voir.
        </p>
      )}
      {params.erreur && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <section aria-labelledby="titre-badge" className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 id="titre-badge" className="text-lg font-semibold">
          Rassurez les autres membres
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Le badge « ✓ Identité vérifiée » s&apos;affiche sur vos annonces et votre profil. Il montre que votre pièce
          d&apos;identité a été contrôlée.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Prix : {prix} € une seule fois, <strong>offert aux membres Pro</strong>.
          </li>
          <li>
            Il vous faut une pièce d&apos;identité valide (carte d&apos;identité, passeport ou permis) et un téléphone
            ou une webcam pour un selfie.
          </li>
          <li>
            La vérification est faite par notre prestataire de paiement Stripe. Dépôt Malin ne reçoit ni ne garde la
            copie de votre pièce d&apos;identité : nous gardons seulement la date de la vérification.
          </li>
        </ul>
      </section>

      {user && (
        <section aria-labelledby="titre-etat" className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 id="titre-etat" className="text-lg font-semibold">
            Ma vérification
          </h2>
          {verifiee ? (
            <p className="mt-2 text-sm font-medium text-green-700">
              ✓ Votre identité est vérifiée depuis le {dateLongue(user.identiteVerifieeLe!)}.
            </p>
          ) : (
            <>
              {statut && LIBELLES_STATUT_VERIFICATION[statut] && (
                <p className="mt-2 text-sm text-gray-700">{LIBELLES_STATUT_VERIFICATION[statut]}</p>
              )}
              {statut !== "processing" &&
                (peutLancer ? (
                  <form action={lancerVerificationIdentite} className="mt-4">
                    <BoutonEnvoi texteEnCours="Ouverture de la vérification…" className={bouton}>
                      {statut === "requires_input" || statut === "canceled"
                        ? "Recommencer la vérification"
                        : "Lancer la vérification"}
                    </BoutonEnvoi>
                  </form>
                ) : (
                  <form action={payerVerificationIdentite} className="mt-4">
                    <BoutonEnvoi texteEnCours="Redirection vers le paiement…" className={bouton}>
                      Obtenir le badge pour {prix} €
                    </BoutonEnvoi>
                  </form>
                ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
