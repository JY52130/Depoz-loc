import { AvertissementJuridique } from "@/components/AvertissementJuridique";

export const metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Mentions légales</h1>
      <AvertissementJuridique />

      <div className="flex flex-col gap-4 text-gray-700">
        <h2 className="text-lg font-semibold text-black">Éditeur du site</h2>
        <p>
          Dépôt Malin — [forme juridique à compléter], [adresse du siège à
          compléter], [SIRET à compléter]. Directeur de la publication :
          [nom à compléter]. Contact : voir la page{" "}
          <a href="/contact" className="underline">Contact</a>.
        </p>

        <h2 className="text-lg font-semibold text-black">Hébergement</h2>
        <p>
          Application hébergée par Vercel Inc. Base de données et
          authentification hébergées par Supabase.
        </p>

        <h2 className="text-lg font-semibold text-black">Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des éléments du site (textes, marques, logos) est
          protégé par le droit de la propriété intellectuelle. Les contenus
          déposés par les membres (photos, descriptions) restent leur
          propriété ; ils accordent à Dépôt Malin une licence d&apos;affichage
          nécessaire au fonctionnement du service.
        </p>

        <h2 className="text-lg font-semibold text-black">Délégué à la protection des données</h2>
        <p>Contact : [à compléter] — voir aussi notre politique de confidentialité.</p>
      </div>
    </article>
  );
}
