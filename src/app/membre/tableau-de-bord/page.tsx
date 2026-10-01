import Link from "next/link";

export const metadata = { title: "Tableau de bord" };

const raccourcis = [
  { href: "/membre/mes-annonces/nouvelle", titre: "Mettre un objet en location", texte: "Créez une annonce en quelques minutes." },
  { href: "/membre/mes-locations", titre: "Mes locations", texte: "Les objets que vous louez, en cours et passés." },
  { href: "/membre/mes-biens-loues", titre: "Mes biens loués", texte: "Les demandes et locations de vos objets." },
  { href: "/membre/messagerie", titre: "Messagerie", texte: "Vos échanges avec les autres membres." },
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {raccourcis.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="block h-full rounded border p-4 hover:border-black">
              <span className="font-medium">{r.titre}</span>
              <span className="mt-1 block text-sm text-gray-600">{r.texte}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
