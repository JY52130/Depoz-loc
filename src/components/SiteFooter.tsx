import Link from "next/link";
import { LogoIcone } from "@/components/Logo";

const liensAide = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/pourquoi-louer", label: "Pourquoi louer ?" },
  { href: "/tarifs", label: "Tarifs & commissions" },
  { href: "/points-relais", label: "Commerçants relais" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const liensLegaux = [
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/contrat-de-location", label: "Contrat de location" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoIcone taille={32} />
            <span className="text-lg font-extrabold tracking-tight text-white">
              Dépôt <span className="text-brand-100">Malin</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-gray-400">
            Louer plutôt qu&apos;acheter, près de chez soi. Partout en France
            métropolitaine.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Aide</p>
          <ul className="mt-3 space-y-2 text-sm">
            {liensAide.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Informations légales</p>
          <ul className="mt-3 space-y-2 text-sm">
            {liensLegaux.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-gray-400">
          © {new Date().getFullYear()} Dépôt Malin. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
