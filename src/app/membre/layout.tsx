import Link from "next/link";
import { Logo } from "@/components/Logo";
import { deconnexion } from "../(auth)/actions";

const liens = [
  { href: "/membre/tableau-de-bord", label: "Tableau de bord" },
  { href: "/membre/profil", label: "Profil public" },
  { href: "/membre/mes-annonces", label: "Mes annonces" },
  { href: "/membre/mes-locations", label: "Mes locations" },
  { href: "/membre/mes-biens-loues", label: "Mes biens loués" },
  { href: "/membre/messagerie", label: "Messagerie" },
  { href: "/membre/portefeuille", label: "Portefeuille" },
  { href: "/membre/avis", label: "Avis" },
  { href: "/membre/etats-des-lieux", label: "États des lieux" },
  { href: "/membre/abonnement-pro", label: "Abonnement Pro" },
  { href: "/membre/parametres", label: "Paramètres" },
];

export default function MembreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-56 shrink-0">
        <Logo />
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {liens.map((lien) => (
            <Link key={lien.href} href={lien.href} className="rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-dark">
              {lien.label}
            </Link>
          ))}
        </nav>
        <form action={deconnexion} className="mt-6">
          <button type="submit" className="text-sm text-gray-500 hover:underline">
            Se déconnecter
          </button>
        </form>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
