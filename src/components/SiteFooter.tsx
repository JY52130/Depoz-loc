import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <Link href="/cgu" className="hover:underline">CGU</Link>
          <Link href="/cgv" className="hover:underline">CGV</Link>
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          <Link href="/cookies" className="hover:underline">Cookies</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Dépôt Malin — France métropolitaine.</p>
      </div>
    </footer>
  );
}
