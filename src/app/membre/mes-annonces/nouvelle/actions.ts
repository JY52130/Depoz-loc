"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { calculerCaution, AGES_MATERIEL, type AgeMateriel } from "@/lib/caution";
import { geocoderAdresse } from "@/lib/geocodage";
import { genererSlugAnnonce } from "@/lib/slugify";
import { lireModesRemise } from "@/lib/livraison";

function nombreOptionnel(formData: FormData, champ: string): number | undefined {
  const valeur = formData.get(champ);
  if (!valeur || String(valeur).trim() === "") return undefined;
  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export async function creerAnnonce(formData: FormData) {
  const user = await getOrCreateUser();
  if (!user) {
    redirect("/connexion?redirect=/membre/mes-annonces/nouvelle");
  }

  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const ageMateriel = String(formData.get("ageMateriel") ?? "") as AgeMateriel;
  const prixNeufEstime = Number(formData.get("prixNeufEstime") ?? 0);
  const attestation = formData.get("attestation") === "on";
  const remise = lireModesRemise(formData);
  const adresse = String(formData.get("adresse") ?? "").trim();
  const ville = String(formData.get("ville") ?? "").trim();
  const codePostal = String(formData.get("codePostal") ?? "").trim();

  let photos: string[] = [];
  try {
    photos = JSON.parse(String(formData.get("photos") ?? "[]"));
  } catch {
    photos = [];
  }

  let disponibilites: { debut: string; fin: string }[] = [];
  try {
    disponibilites = JSON.parse(String(formData.get("disponibilites") ?? "[]"));
  } catch {
    disponibilites = [];
  }

  const tarifs = {
    prixDemiJournee: nombreOptionnel(formData, "prixDemiJournee"),
    prixJournee: nombreOptionnel(formData, "prixJournee"),
    prixSemaine: nombreOptionnel(formData, "prixSemaine"),
    prixMois: nombreOptionnel(formData, "prixMois"),
  };

  // --- Validation (section 6.2) ---
  const erreurs: string[] = [];
  if (!titre) erreurs.push("Le titre est obligatoire.");
  if (!categoryId) erreurs.push("La catégorie est obligatoire.");
  if (!Object.values(tarifs).some((v) => v != null)) {
    erreurs.push("Au moins un tarif (demi-journée, journée, semaine ou mois) doit être renseigné.");
  }
  if (!AGES_MATERIEL.includes(ageMateriel)) erreurs.push("L'âge du matériel est invalide.");
  if (!prixNeufEstime || prixNeufEstime <= 0) erreurs.push("Le prix neuf estimé doit être renseigné.");
  if (!attestation) erreurs.push("L'attestation sur l'honneur doit être cochée.");
  erreurs.push(...remise.erreurs);

  if (erreurs.length > 0) {
    redirect(
      `/membre/mes-annonces/nouvelle?erreur=${encodeURIComponent(erreurs.join(" "))}`
    );
  }

  const montantCaution = calculerCaution(prixNeufEstime, ageMateriel);

  // Géocodage (France métropolitaine) — best effort, ne bloque pas la publication.
  const requeteGeocodage = [adresse, codePostal, ville].filter(Boolean).join(" ");
  const geo = requeteGeocodage ? await geocoderAdresse(requeteGeocodage) : null;

  const listing = await prisma.listing.create({
    data: {
      slug: genererSlugAnnonce(titre),
      proprietaireId: user.id,
      categoryId,
      titre,
      description,
      photos,
      prixDemiJournee: tarifs.prixDemiJournee,
      prixJournee: tarifs.prixJournee,
      prixSemaine: tarifs.prixSemaine,
      prixMois: tarifs.prixMois,
      prixNeufEstime,
      ageMateriel,
      montantCaution,
      cautionEstimeeParIA: formData.get("estimeParIA") === "true",
      attestationHonneur: attestation,
      modesRemise: remise.modesRemise,
      prixLivraison: remise.prixLivraison,
      distanceLivraisonKm: remise.distanceLivraisonKm,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      ville: geo?.ville || ville || undefined,
      codePostal: geo?.codePostal || codePostal || undefined,
      adresse: adresse || undefined,
      statut: "EN_ATTENTE_MODERATION", // Modération avant mise en ligne (section 6.2 étape 9, Phase 5).
      availabilities: {
        create: disponibilites
          .filter((d) => d.debut && d.fin)
          .map((d) => ({ dateDebut: new Date(d.debut), dateFin: new Date(d.fin) })),
      },
    },
  });

  revalidatePath("/membre/mes-annonces");
  redirect(`/membre/mes-annonces?creee=${listing.slug}`);
}
