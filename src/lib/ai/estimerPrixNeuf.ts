// Estimation IA du prix neuf d'un matériel (sections 9.2 / 11.3).
// Utilisé pour proposer un montant de caution ; le propriétaire reste libre
// de corriger la valeur avant publication (attestation sur l'honneur, section 9.2).
//
// Repli : si la clé API est absente, si l'appel échoue, ou si la réponse n'est
// pas exploitable, on renvoie { succes: false } et l'appelant doit basculer
// sur une saisie manuelle.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODELE = "claude-sonnet-5";

export type EstimationPrixNeuf =
  | { succes: true; prixNeufEstime: number; confiance: "haute" | "moyenne" | "basse" }
  | { succes: false; raison: "cle_absente" | "erreur_appel" | "reponse_invalide" };

export async function estimerPrixNeuf(nomMateriel: string): Promise<EstimationPrixNeuf> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { succes: false, raison: "cle_absente" };
  }

  const prompt = `Tu estimes le prix neuf (en euros, marché français, TTC) d'un objet à partir de son nom pour calculer une caution de location. Objet : "${nomMateriel}".
Réponds STRICTEMENT avec un objet JSON, sans texte autour, au format :
{"prixNeufEstime": <nombre>, "confiance": "haute" | "moyenne" | "basse"}
Si le nom est trop vague pour être estimé, choisis le prix neuf le plus probable pour un modèle grand public de cette catégorie et indique "confiance": "basse".`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELE,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { succes: false, raison: "erreur_appel" };
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };

    const texte = data.content?.find((bloc) => bloc.type === "text")?.text ?? "";
    const jsonMatch = texte.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { succes: false, raison: "reponse_invalide" };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      prixNeufEstime?: number;
      confiance?: string;
    };

    if (typeof parsed.prixNeufEstime !== "number" || parsed.prixNeufEstime <= 0) {
      return { succes: false, raison: "reponse_invalide" };
    }

    const confiance =
      parsed.confiance === "haute" || parsed.confiance === "moyenne" || parsed.confiance === "basse"
        ? parsed.confiance
        : "basse";

    return {
      succes: true,
      prixNeufEstime: Math.round(parsed.prixNeufEstime * 100) / 100,
      confiance,
    };
  } catch {
    return { succes: false, raison: "erreur_appel" };
  }
}
