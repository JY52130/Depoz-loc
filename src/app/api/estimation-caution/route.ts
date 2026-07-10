import { NextResponse } from "next/server";
import { estimerPrixNeuf } from "@/lib/ai/estimerPrixNeuf";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { nomMateriel?: string } | null;
  const nomMateriel = body?.nomMateriel?.trim();

  if (!nomMateriel) {
    return NextResponse.json(
      { succes: false, raison: "reponse_invalide" as const },
      { status: 400 }
    );
  }

  const resultat = await estimerPrixNeuf(nomMateriel);
  return NextResponse.json(resultat);
}
