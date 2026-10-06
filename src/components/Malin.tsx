import Image from "next/image";

// Malin, la mascotte de Dépôt Malin, dans ses différentes poses
// (images détourées, fond transparent, dans public/malin/).
const POSES = {
  accueil: { largeur: 608, hauteur: 900 },
  assistance: { largeur: 626, hauteur: 900 },
  contact: { largeur: 659, hauteur: 900 },
  livraison: { largeur: 643, hauteur: 900 },
  promotion: { largeur: 642, hauteur: 900 },
  saison: { largeur: 623, hauteur: 900 },
  securite: { largeur: 684, hauteur: 900 },
  stockage: { largeur: 735, hauteur: 900 },
  validation: { largeur: 607, hauteur: 900 },
  malin: { largeur: 608, hauteur: 900 },
} as const;

export type PoseMalin = keyof typeof POSES;

/**
 * Illustration décorative : alt="" par défaut (RGAA 1.2), le texte de la
 * page porte l'information. Passer `alt` seulement si l'image informe.
 */
export function Malin({
  pose,
  hauteur = 220,
  className = "",
  prioritaire = false,
  alt = "",
  classeTaille,
}: {
  pose: PoseMalin;
  hauteur?: number;
  /** Classes de hauteur responsive (ex. "h-44 md:h-96") à la place de `hauteur`. */
  classeTaille?: string;
  className?: string;
  prioritaire?: boolean;
  alt?: string;
}) {
  const { largeur, hauteur: h } = POSES[pose];
  const largeurAffichee = Math.round((largeur / h) * hauteur);
  return (
    <Image
      src={`/malin/${pose}.webp`}
      alt={alt}
      width={largeurAffichee}
      height={hauteur}
      priority={prioritaire}
      className={`w-auto drop-shadow-xl ${classeTaille ?? ""} ${className}`}
      style={classeTaille ? undefined : { height: hauteur }}
    />
  );
}

/** Titre de page avec Malin à droite (en dessous sur mobile). */
export function TitreAvecMalin({
  titre,
  pose,
  children,
}: {
  titre: string;
  pose: PoseMalin;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col-reverse items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-50 to-creme-fonce px-6 py-6 sm:flex-row sm:justify-between sm:px-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">{titre}</h1>
        {children && <div className="mt-2 text-gray-700">{children}</div>}
      </div>
      <Malin pose={pose} classeTaille="h-36 sm:h-44" className="shrink-0" />
    </div>
  );
}
