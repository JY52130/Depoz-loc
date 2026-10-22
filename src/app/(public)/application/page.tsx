import { TitreAvecMalin } from "@/components/Malin";
import { BoutonInstallerAppli } from "@/components/BoutonInstallerAppli";

export const metadata = {
  title: "L'application",
  description:
    "Installez Dépôt Malin sur votre téléphone en quelques secondes, gratuitement et sans passer par un store.",
};

export default function ApplicationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <TitreAvecMalin titre="Dépôt Malin sur votre téléphone" pose="malin" />
      <p className="mt-4 text-gray-700">
        Ajoutez Dépôt Malin à l&apos;écran d&apos;accueil de votre téléphone : il s&apos;ouvre en plein écran, comme une
        application, d&apos;un simple appui sur l&apos;icône. C&apos;est gratuit, rapide, et rien à télécharger depuis
        un store.
      </p>

      <div className="mt-6">
        <BoutonInstallerAppli />
      </div>

      <h2 className="mt-8 text-xl font-semibold">Sur Android (Chrome, Samsung Internet)</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
        <li>Ouvrez le site Dépôt Malin dans Chrome.</li>
        <li>Appuyez sur le menu, les trois points en haut à droite.</li>
        <li>Choisissez « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil ».</li>
        <li>Confirmez : l&apos;icône Dépôt Malin apparaît avec vos autres applications.</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold">Sur iPhone et iPad (Safari)</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
        <li>Ouvrez le site Dépôt Malin dans Safari.</li>
        <li>Appuyez sur le bouton Partager, le carré avec une flèche vers le haut, en bas de l&apos;écran.</li>
        <li>Faites défiler et choisissez « Sur l&apos;écran d&apos;accueil ».</li>
        <li>Appuyez sur « Ajouter » en haut à droite.</li>
      </ol>

      <p className="mt-8 text-sm text-gray-600">
        L&apos;application affiche le site Dépôt Malin : vos annonces, réservations, messages et paiements sont les
        mêmes. Pour la retirer, faites un appui long sur l&apos;icône puis « Supprimer ».
      </p>
    </main>
  );
}
