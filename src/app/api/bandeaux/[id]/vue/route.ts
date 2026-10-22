import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Compte une vue d'un bandeau publicitaire (voir CompteurVueBandeau).
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.bandeau.updateMany({ where: { id }, data: { vues: { increment: 1 } } });
  return new NextResponse(null, { status: 204 });
}
