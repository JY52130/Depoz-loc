import Link from "next/link";
import { Logo } from "@/components/Logo";

const liens = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/points-relais", label: "Nos points relais" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden gap-1 text-sm font-medium text-gray-600 md:flex">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="rounded-lg px-3 py-2 transition-colors hover:bg-brand-50 hover:text-brand-dark"
            >
              {lien.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/connexion"
            className="hidden rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-lg bg-brand px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-dark"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}
