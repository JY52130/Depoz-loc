// Catégories de 1er niveau (section 17 — liste validée).
// Source de vérité pour le seed (prisma/seed.ts) et les pages SEO
// /location/[categorie] (generateStaticParams).

export type CategorieRef = {
  nom: string;
  slug: string;
  description: string;
};

export const CATEGORIES: CategorieRef[] = [
  { nom: "Outillage & bricolage", slug: "outillage-bricolage", description: "Perceuses, ponceuses, échelles, matériel de chantier..." },
  { nom: "Jardinage & extérieur", slug: "jardinage-exterieur", description: "Tondeuses, taille-haies, motoculteurs, mobilier de jardin..." },
  { nom: "Électroménager", slug: "electromenager", description: "Nettoyeurs vapeur, appareils de cuisine, climatiseurs mobiles..." },
  { nom: "Informatique & high-tech", slug: "informatique-high-tech", description: "Ordinateurs, vidéoprojecteurs, matériel réseau..." },
  { nom: "Image & son", slug: "image-son", description: "Appareils photo, enceintes, éclairage vidéo..." },
  { nom: "Sport & loisirs", slug: "sport-loisirs", description: "Vélos, matériel de fitness, jeux de plein air..." },
  { nom: "Camping & plein air", slug: "camping-plein-air", description: "Tentes, sacs de couchage, matériel de randonnée..." },
  { nom: "Bébé & enfant", slug: "bebe-enfant", description: "Poussettes, lits parapluie, sièges auto..." },
  { nom: "Événementiel & réception", slug: "evenementiel-reception", description: "Vaisselle, tables, chaises, sonorisation..." },
  { nom: "Mobilier & déco", slug: "mobilier-deco", description: "Meubles, luminaires, décoration événementielle..." },
  { nom: "Auto / moto / vélo", slug: "auto-moto-velo", description: "Coffres de toit, remorques, outillage spécifique..." },
  { nom: "Instruments de musique", slug: "instruments-musique", description: "Guitares, claviers, matériel de sonorisation..." },
];
