import Link from "next/link";

// Logo Dépôt Malin : deux flèches qui tournent autour d'un colis (l'objet circule).
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#0F766E" />
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 30a18 18 0 0 1 32-10" />
        <path d="M47 13v8h-8" />
        <path d="M50 34a18 18 0 0 1-32 10" />
        <path d="M17 51v-8h8" />
      </g>
      <rect x="25" y="25" width="14" height="14" rx="2.5" fill="#F59E0B" />
      <path d="M25 30h14" stroke="#B45309" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Dépôt Malin, accueil">
      <LogoIcone />
      <span className={`text-xl font-extrabold tracking-tight ${clair ? "text-white" : "text-ink"}`}>
        Dépôt <span className={clair ? "text-brand-100" : "text-brand"}>Malin</span>
      </span>
    </Link>
  );
}
