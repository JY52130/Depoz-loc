import Link from "next/link";

// Logo Dépôt Malin : un repère de localisation qui contient un colis.
export function LogoIcone({ taille = 36 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0F766E" />
      <path
        d="M20 7.5c-6.1 0-10.8 4.6-10.8 10.5 0 7.4 8.7 13.7 9.9 14.5.5.4 1.3.4 1.8 0 1.2-.8 9.9-7.1 9.9-14.5 0-5.9-4.7-10.5-10.8-10.5z"
        fill="#fff"
      />
      <path d="M20 12.6l5.2 2.6-5.2 2.6-5.2-2.6z" fill="#FCD34D" />
      <path d="M14.8 15.2l5.2 2.6v5.8l-5.2-2.6z" fill="#F59E0B" />
      <path d="M25.2 15.2L20 17.8v5.8l5.2-2.6z" fill="#D97706" />
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
