import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifierAnnonceBientotExpiree } from "@/lib/email/notifications";
import { JOURS_RAPPEL_AVANT_EXPIRATION, STATUTS_LOCATION_PAYEE } from "@/lib/dureeAnnonce";

// Tâche quotidienne (vercel.json > crons) : prévient chaque propriétaire
// dont l'annonce expire dans 3 jours. Lancée une fois par jour, elle prend
// les annonces qui expirent entre J+2 et J+3 : chacune reçoit un seul rappel.
// Vercel envoie « Authorization: Bearer <CRON_SECRET> » quand la variable
// CRON_SECRET est définie ; sans elle, la route refuse tout appel.

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://depotmalin.fr";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const maintenant = Date.now();
  const annonces = await prisma.listing.findMany({
    where: {
      statut: "EN_LIGNE",
      enLigneJusquau: {
        gt: new Date(maintenant + (JOURS_RAPPEL_AVANT_EXPIRATION - 1) * MS_PAR_JOUR),
        lte: new Date(maintenant + JOURS_RAPPEL_AVANT_EXPIRATION * MS_PAR_JOUR),
      },
    },
    include: {
      proprietaire: { select: { email: true } },
      _count: { select: { bookings: { where: { statut: { in: STATUTS_LOCATION_PAYEE } } } } },
    },
  });

  for (const annonce of annonces) {
    await notifierAnnonceBientotExpiree({
      emailProprietaire: annonce.proprietaire.email,
      titreAnnonce: annonce.titre,
      enLigneJusquau: annonce.enLigneJusquau!,
      prolongationGratuite: annonce._count.bookings > 0,
      lien: `${siteUrl}/membre/mes-annonces`,
    });
  }

  return NextResponse.json({ rappels: annonces.length });
}
