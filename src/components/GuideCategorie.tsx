import type { GuideCategorie as Guide } from "@/lib/guidesCategories";

// Guide « Bien louer » d'une catégorie (voir src/lib/guidesCategories.ts).
export function GuideCategorie({ nomCategorie, guide }: { nomCategorie: string; guide: Guide }) {
  const blocs = [
    { titre: "Avant de partir avec l'objet, vérifiez", items: guide.verifier },
    { titre: "Pensez aussi à prévoir", items: guide.prevoir },
    { titre: "Vous mettez en location ?", items: guide.proprietaire },
  ];
  return (
    <section id="guide" aria-labelledby="titre-guide" className="mt-12 rounded-3xl bg-brand-50 p-6 sm:p-8">
      <h2 id="titre-guide" className="text-2xl font-semibold">
        Bien louer : {nomCategorie}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {blocs.map((bloc) => (
          <div key={bloc.titre}>
            <h3 className="font-semibold text-brand-dark">{bloc.titre}</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
              {bloc.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
