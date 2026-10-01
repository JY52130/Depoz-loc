import { prisma } from "@/lib/prisma";
import { NouvelleAnnonceForm } from "@/components/NouvelleAnnonceForm";

export const metadata = { title: "Créer une annonce" };

type Props = {
  searchParams: Promise<{ erreur?: string }>;
};

export default async function NouvelleAnnoncePage({ searchParams }: Props) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { ordre: "asc" },
    select: { id: true, nom: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Créer une annonce</h1>
      <p className="mt-2 text-gray-600">
        Parcours en plusieurs sections (section 6.2 de la base de
        connaissance). Votre annonce sera soumise à modération avant d&apos;être
        visible publiquement.
      </p>

      {params.erreur && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <div className="mt-8">
        <NouvelleAnnonceForm categories={categories} />
      </div>
    </div>
  );
}
