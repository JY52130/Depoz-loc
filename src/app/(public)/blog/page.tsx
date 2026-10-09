import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { GUIDES_CATEGORIES } from "@/lib/guidesCategories";

export const metadata = {
  title: "Blog",
  description: "Nos guides « Bien louer » par catégorie : que vérifier, quoi prévoir et nos conseils aux propriétaires.",
};

export default function BlogPage() {
  const guides = CATEGORIES.filter((c) => GUIDES_CATEGORIES[c.slug]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="mt-4 text-gray-700">
        Nos conseils pour louer malin : que vérifier à la remise, quoi prévoir et comment bien préparer un objet
        que vous mettez en location. Lisez aussi{" "}
        <Link href="/pourquoi-louer" className="font-medium text-brand underline hover:text-brand-dark">
          pourquoi louer plutôt qu&apos;acheter
        </Link>
        .
      </p>
      <h2 className="mt-8 text-xl font-semibold">Guides « Bien louer » par catégorie</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {guides.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/location/${c.slug}#guide`}
              className="block rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-brand"
            >
              <span className="font-medium text-brand-dark">Bien louer : {c.nom}</span>
              <span className="mt-1 block text-sm text-gray-600">{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
