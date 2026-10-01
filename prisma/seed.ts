// Seed de base : catégories de 1er niveau + le point relais de lancement (Haute-Marne).
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

  const relaisExistant = await prisma.relayPoint.findFirst({
    where: { codePostal: "52000" },
  });

  if (!relaisExistant) {
    await prisma.relayPoint.create({
      data: {
        nom: "Dépôt Malin — Point relais Chaumont",
        adresse: "À compléter",
        ville: "Chaumont",
        codePostal: "52000",
        horaires: "À compléter",
      },
    });
    console.log("Point relais de Haute-Marne créé.");
  } else {
    console.log("Point relais de Haute-Marne déjà présent.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
