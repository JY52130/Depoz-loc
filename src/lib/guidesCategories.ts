// Guides « Bien louer » affichés sur chaque page catégorie /location/[categorie]
// et listés sur /blog (idée tirée des sites concurrents, 9 octobre 2026) :
// que vérifier, quoi prévoir, conseils au propriétaire. Clé = slug de la
// catégorie (voir src/lib/categories.ts).

export type GuideCategorie = {
  verifier: string[];
  prevoir: string[];
  proprietaire: string[];
};

export const GUIDES_CATEGORIES: Record<string, GuideCategorie> = {
  "outillage-bricolage": {
    verifier: [
      "Testez l'outil devant le propriétaire : il démarre, tourne sans bruit anormal, le câble n'est pas abîmé.",
      "Pour un outil sur batterie, vérifiez qu'elle est chargée et que le chargeur est fourni.",
      "Choisissez la bonne puissance : une perceuse simple pour le bois et le placo, un perforateur pour le béton.",
    ],
    prevoir: [
      "Les consommables ne sont pas toujours fournis : forets, disques, lames, papier de ponçage.",
      "Vos protections : lunettes, gants, casque antibruit, masque contre la poussière.",
      "Une rallonge adaptée à la puissance de l'outil.",
    ],
    proprietaire: [
      "Indiquez dans l'annonce les accessoires fournis et ceux à acheter.",
      "Rangez l'outil dans sa mallette avec la notice : il est plus simple à vérifier au retour.",
    ],
  },
  "jardinage-exterieur": {
    verifier: [
      "Pour une machine thermique, demandez le type de carburant (essence, mélange 2 temps) et faites un essai de démarrage.",
      "Regardez l'état des lames et du fil de coupe.",
      "Vérifiez que l'objet tient dans votre véhicule, ou proposez la livraison au propriétaire.",
    ],
    prevoir: [
      "Le carburant et le fil de coupe, selon l'accord avec le propriétaire.",
      "Des chaussures fermées, des gants et des lunettes de protection.",
    ],
    proprietaire: [
      "Précisez si l'objet est rendu avec le plein ou non.",
      "Nettoyez la machine avant la remise, et demandez qu'elle soit rendue propre.",
    ],
  },
  electromenager: {
    verifier: [
      "Branchez et testez l'appareil sur place.",
      "Vérifiez que les pièces amovibles sont toutes là : bacs, filtres, embouts, couvercles.",
      "Pour un nettoyeur vapeur ou une shampouineuse, demandez quels produits utiliser.",
    ],
    prevoir: [
      "Les produits d'entretien adaptés (certains appareils n'acceptent que de l'eau).",
      "Un sac ou un carton pour le transport.",
    ],
    proprietaire: [
      "Laissez la notice avec l'appareil, ou indiquez où la trouver en ligne.",
      "Videz et nettoyez réservoirs et filtres avant chaque location.",
    ],
  },
  "informatique-high-tech": {
    verifier: [
      "Allumez l'appareil et vérifiez l'écran, le son et les connexions.",
      "Vérifiez que les câbles (alimentation, HDMI) et la télécommande sont fournis.",
      "Pour un vidéoprojecteur, vérifiez qu'il se branche sur votre ordinateur (HDMI, USB-C).",
    ],
    prevoir: [
      "Un adaptateur si votre ordinateur n'a pas la même prise.",
      "Une housse ou un carton rembourré pour le transport.",
    ],
    proprietaire: [
      "Effacez vos données et déconnectez vos comptes avant de louer un ordinateur ou une tablette.",
      "Notez le numéro de série dans l'état des lieux.",
    ],
  },
  "image-son": {
    verifier: [
      "Faites quelques photos ou un essai de son avant de partir.",
      "Vérifiez l'état des objectifs, des écrans et des batteries.",
      "Assurez-vous d'avoir le chargeur et les câbles.",
    ],
    prevoir: [
      "Une carte mémoire, si elle n'est pas fournie.",
      "Un sac de transport adapté pour protéger le matériel.",
    ],
    proprietaire: [
      "Videz la carte mémoire avant la remise.",
      "Photographiez l'objectif et l'écran dans l'état des lieux.",
    ],
  },
  "sport-loisirs": {
    verifier: [
      "Choisissez la bonne taille (vélo, rollers, combinaison).",
      "Pour un vélo : freins, pneus gonflés, vitesses qui passent.",
      "Vérifiez les fixations et les sangles.",
    ],
    prevoir: [
      "Votre casque et vos protections si elles ne sont pas fournies.",
      "Un antivol pour un vélo.",
    ],
    proprietaire: [
      "Indiquez la taille et le poids maximum conseillé.",
      "Gonflez et réglez le matériel avant la remise.",
    ],
  },
  "camping-plein-air": {
    verifier: [
      "Montez la tente une première fois chez vous, ou avec le propriétaire, pour vérifier qu'il ne manque rien.",
      "Comptez les sardines et les arceaux.",
      "Vérifiez les fermetures éclair et l'absence de trous.",
    ],
    prevoir: [
      "Un maillet si vous campez sur un sol dur.",
      "Un temps de séchage au retour : une tente rendue mouillée peut moisir.",
    ],
    proprietaire: [
      "Indiquez le nombre de places et le temps de montage.",
      "Demandez que la tente soit rendue sèche et propre.",
    ],
  },
  "bebe-enfant": {
    verifier: [
      "Pour un siège auto, vérifiez la norme (R129 ou R44) et qu'il est adapté au poids et à l'âge de l'enfant.",
      "Vérifiez que le siège auto n'a jamais subi d'accident : demandez-le au propriétaire.",
      "Pour une poussette ou un lit parapluie, testez le pliage et les freins.",
    ],
    prevoir: [
      "Un drap ou une housse à vous pour le lit ou le matelas.",
      "Le temps d'installer le siège auto avant de partir.",
    ],
    proprietaire: [
      "Lavez les housses et désinfectez le matériel avant chaque location.",
      "Indiquez l'année d'achat du siège auto et ne louez pas un siège accidenté.",
    ],
  },
  "evenementiel-reception": {
    verifier: [
      "Comptez les pièces (tables, chaises, vaisselle) à la remise et notez-les dans l'état des lieux.",
      "Pour une sono, faites un essai de son.",
      "Réservez tôt : le matériel de fête part vite les week-ends.",
    ],
    prevoir: [
      "Un véhicule assez grand, ou la livraison par le propriétaire.",
      "Le nettoyage de la vaisselle avant le retour, selon l'accord.",
    ],
    proprietaire: [
      "Indiquez le nombre exact de pièces dans l'annonce.",
      "Précisez si la vaisselle est rendue lavée ou non.",
    ],
  },
  "mobilier-deco": {
    verifier: [
      "Mesurez l'espace disponible chez vous et l'objet avant de réserver.",
      "Vérifiez la stabilité et l'état des surfaces (rayures, taches).",
    ],
    prevoir: [
      "Des couvertures pour protéger le meuble pendant le transport.",
      "Une ou deux personnes pour porter.",
    ],
    proprietaire: [
      "Donnez les dimensions et le poids dans l'annonce.",
      "Photographiez les petits défauts existants dans l'état des lieux.",
    ],
  },
  "auto-moto-velo": {
    verifier: [
      "Pour une remorque : vérifiez qu'elle s'adapte à votre attelage et que votre permis suffit pour le poids total.",
      "Contrôlez les feux, les pneus et la carte grise de la remorque.",
      "Pour un coffre de toit, vérifiez qu'il est compatible avec vos barres.",
    ],
    prevoir: [
      "Des sangles pour arrimer le chargement.",
      "Un adaptateur électrique si la prise de la remorque diffère (7 ou 13 broches).",
    ],
    proprietaire: [
      "Indiquez le poids maximum, le type de prise et le permis nécessaire.",
      "Fournissez une copie de la carte grise de la remorque avec l'objet.",
    ],
  },
  "instruments-musique": {
    verifier: [
      "Jouez quelques notes pour vérifier l'accord et l'absence de bruit parasite.",
      "Vérifiez les cordes, les touches et les branchements.",
    ],
    prevoir: [
      "Un étui ou une housse pour le transport.",
      "Des câbles et un ampli si l'instrument est électrique.",
    ],
    proprietaire: [
      "Accordez l'instrument avant la remise.",
      "Indiquez si l'étui, l'accordeur ou les câbles sont fournis.",
    ],
  },
};
