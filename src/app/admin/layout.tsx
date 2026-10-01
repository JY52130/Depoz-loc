import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

const liens = [
  { href: "/admin/utilisateurs-annonces", label: "Utilisateurs & annonces" },
  { href: "/admin/point-relais", label: "Point relais" },
  { href: "/admin/litiges", label: "Litiges" },
  { href: "/admin/finances", label: "Finances" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Contrôle de rôle admin (section 3.2). Le middleware (src/middleware.ts)
  // vérifie seulement qu'un utilisateur est connecté ; ce layout vérifie en
  // plus qu'il est administrateur. 404 plutôt que redirection pour ne pas
  // confirmer l'existence des pages du back-office à un membre non autorisé.
  const user = await getOrCreateUser();
  if (!user || !user.estAdmin) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-56 shrink-0">
        <p className="text-lg font-semibold">Back-office</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {liens.map((lien) => (
            <Link key={lien.href} href={lien.href} className="rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-dark">
              {lien.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
