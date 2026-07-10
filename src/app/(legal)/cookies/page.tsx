import { AvertissementJuridique } from "@/components/AvertissementJuridique";

export const metadata = { title: "Politique cookies" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Politique cookies</h1>
      <AvertissementJuridique />

      <div className="flex flex-col gap-4 text-gray-700">
        <p>
          Nous utilisons des cookies et technologies similaires pour faire
          fonctionner le site, mesurer l&apos;audience et, si vous
          l&apos;acceptez, afficher de la publicité personnalisée.
        </p>

        <h2 className="text-lg font-semibold text-black">Cookies strictement nécessaires</h2>
        <p>
          Toujours actifs : session d&apos;authentification (Supabase Auth) et
          mémorisation de votre choix de consentement. Sans finalité
          publicitaire, ils ne nécessitent pas de consentement préalable.
        </p>

        <h2 className="text-lg font-semibold text-black">Cookies publicitaires (Google AdSense)</h2>
        <p>
          Le script Google AdSense n&apos;est chargé qu&apos;après votre
          acceptation via le bandeau affiché sur le site. Il peut déposer des
          cookies tiers permettant d&apos;afficher des annonces pertinentes.
          Vous pouvez retirer votre consentement à tout moment en effaçant
          les cookies de votre navigateur ou en nous recontactant.
        </p>

        <h2 className="text-lg font-semibold text-black">Gestion de votre choix</h2>
        <p>
          Votre choix (accepté / refusé) est mémorisé dans un cookie nommé{" "}
          <code>depozloc_consentement</code>, valable 6 mois. Pour revenir sur
          votre choix, supprimez ce cookie via les paramètres de votre
          navigateur — le bandeau réapparaîtra à votre prochaine visite.
        </p>
      </div>
    </article>
  );
}
