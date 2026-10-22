"use client";

// Bouton « Installer l'application » : n'apparaît que si le navigateur
// propose l'installation (Chrome, Edge, Samsung Internet sur Android et
// ordinateur). Sur iPhone, l'installation se fait par le menu Partager
// (expliqué sur la page /application).
import { useEffect, useState } from "react";

type EvenementInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function BoutonInstallerAppli() {
  const [evenement, setEvenement] = useState<EvenementInstallation | null>(null);
  const [installee, setInstallee] = useState(false);

  useEffect(() => {
    const surProposition = (e: Event) => {
      e.preventDefault();
      setEvenement(e as EvenementInstallation);
    };
    const surInstallation = () => {
      setInstallee(true);
      setEvenement(null);
    };
    window.addEventListener("beforeinstallprompt", surProposition);
    window.addEventListener("appinstalled", surInstallation);
    return () => {
      window.removeEventListener("beforeinstallprompt", surProposition);
      window.removeEventListener("appinstalled", surInstallation);
    };
  }, []);

  if (installee) {
    return (
      <p role="status" className="font-medium text-green-700">
        C&apos;est fait : Dépôt Malin est sur votre écran d&apos;accueil.
      </p>
    );
  }
  if (!evenement) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await evenement.prompt();
        await evenement.userChoice;
        setEvenement(null);
      }}
      className="rounded-full bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
    >
      Installer l&apos;application
    </button>
  );
}
