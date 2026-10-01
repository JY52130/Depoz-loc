"use client";

import { useFormStatus } from "react-dom";

// Bouton d'envoi désactivé pendant l'envoi du formulaire, pour éviter les
// doubles clics (et donc les doublons).
export function BoutonEnvoi({
  children,
  texteEnCours,
  className,
}: {
  children: React.ReactNode;
  texteEnCours: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className ?? ""} disabled:opacity-60`}>
      {pending ? texteEnCours : children}
    </button>
  );
}
