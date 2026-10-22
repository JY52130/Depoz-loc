import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Clic sur un bandeau publicitaire : compte le clic puis renvoie vers le
// site du commerçant. Aucun cookie, aucune donnée sur le visiteur.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bandeau = await prisma.bandeau
    .update({ where: { id }, data: { clics: { increment: 1 } }, select: { lien: true } })
    .catch(() => null);
  return NextResponse.redirect(bandeau?.lien ?? new URL("/", request.url), 302);
}
