import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LiensCompte } from "@/components/LiensCompte";

const liens = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/points-relais", label: "Nos points relais" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-creme/90 backdrop-blur">
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
          <LiensCompte />
        </div>
      </div>
    </header>
  );
}
