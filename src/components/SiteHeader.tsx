import Link from "next/link";

const liens = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/points-relais", label: "Nos points relais" },
  { href: "/tarifs", label: "Tarifs & commissions" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Dépôt Malin
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {liens.map((lien) => (
            <Link key={lien.href} href={lien.href} className="hover:underline">
              {lien.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-3 text-sm">
          <Link href="/connexion" className="hover:underline">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded bg-black px-3 py-1.5 text-white"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}
