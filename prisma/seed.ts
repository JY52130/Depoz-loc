// Seed de base : catégories de 1er niveau.
// Lancer avec : npx prisma db seed

import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

async function main() {
  for (const [index, categorie] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: categorie.slug },
      update: { nom: categorie.nom, description: categorie.description, ordre: index },
      create: {
        nom: categorie.nom,
        slug: categorie.slug,
        description: categorie.description,
        ordre: index,
      },
    });
  }
  console.log(`${CATEGORIES.length} catégories synchronisées.`);
  // Les commerçants relais sont ajoutés depuis l'espace admin (/admin/point-relais).
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
