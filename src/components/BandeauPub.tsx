// Emplacement publicitaire vendu aux commerçants locaux (voir
// src/lib/bandeaux.ts). Sans bandeau en cours, on affiche une annonce de
// Dépôt Malin lui-même, jamais un espace vide.
// RGAA : mention « Publicité » en texte, image avec texte alternatif, lien
// explicite, aucune animation ni ouverture de fenêtre automatique.
import Image from "next/image";
import Link from "next/link";
import type { EmplacementBandeau } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HAUTEUR_IMAGE_BANDEAU, LARGEUR_IMAGE_BANDEAU } from "@/lib/bandeaux";
import { offreLancementActive } from "@/lib/offresLancement";
import { CompteurVueBandeau } from "./CompteurVueBandeau";

async function bandeauDuMoment(emplacement: EmplacementBandeau) {
  const maintenant = new Date();
  const enCours = await prisma.bandeau.findMany({
    where: { emplacement, actif: true, debut: { lte: maintenant }, fin: { gt: maintenant } },
    select: { id: true, annonceur: true, imageUrl: true, texteAlternatif: true },
  });
  if (enCours.length === 0) return null;
  // Plusieurs commerçants sur le même emplacement : chacun son tour.
  return enCours[Math.floor(Math.random() * enCours.length)];
}

const AUTOPROMOTION: Record<EmplacementBandeau, { titre: string; texte: string; lien: string; bouton: string }> = {
  ACCUEIL: {
    titre: "Commerçant près de Saint-Dizier ?",
    texte: "Faites connaître votre commerce aux habitants du coin grâce à un bandeau sur Dépôt Malin.",
    lien: "/annoncer",
    bouton: "Annoncer sur Dépôt Malin",
  },
  LISTE: {
    titre: "Vous êtes professionnel ?",
    texte: "Annonces sans limite de durée, badge Pro et une mise « À la une » offerte chaque mois.",
    lien: "/membre/abonnement-pro",
    bouton: "Découvrir l'abonnement Pro",
  },
};

const OFFRE_LANCEMENT = {
  titre: "Offre de lancement",
  texte: "0 % de commission pour les propriétaires et 7 jours « À la une » offerts aux 100 premiers membres.",
  lien: "/membre/mes-annonces/nouvelle",
  bouton: "Publier une annonce",
};

export async function BandeauPub({
  emplacement,
  className = "mx-auto max-w-6xl px-4",
}: { emplacement: EmplacementBandeau; className?: string }) {
  const bandeau = await bandeauDuMoment(emplacement).catch(() => null);

  if (bandeau) {
    return (
      <aside aria-label="Publicité" className={className}>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-600">Publicité</p>
        <a
          href={`/api/bandeaux/${bandeau.id}/clic`}
          rel="sponsored noopener"
          className="block overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <Image
            src={bandeau.imageUrl}
            alt={bandeau.texteAlternatif}
            width={LARGEUR_IMAGE_BANDEAU}
            height={HAUTEUR_IMAGE_BANDEAU}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="h-auto w-full"
          />
          <span className="sr-only"> ({bandeau.annonceur}, site du commerçant)</span>
        </a>
        <CompteurVueBandeau bandeauId={bandeau.id} />
      </aside>
    );
  }

  const promo = emplacement === "ACCUEIL" && offreLancementActive() ? OFFRE_LANCEMENT : AUTOPROMOTION[emplacement];
  return (
    <aside aria-label="Dépôt Malin vous informe" className={className}>
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">{promo.titre}</p>
          <p className="mt-0.5 text-sm text-gray-700">{promo.texte}</p>
        </div>
        <Link
          href={promo.lien}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {promo.bouton}
        </Link>
      </div>
    </aside>
  );
}
