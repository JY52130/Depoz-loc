// Envoi d'emails transactionnels (section 11.5) via l'API Resend.
// Repli silencieux (log serveur) si RESEND_API_KEY est absent, pour ne
// jamais bloquer un flux métier (paiement, litige...) à cause d'un email.

const RESEND_API_URL = "https://api.resend.com/emails";
const EXPEDITEUR_PAR_DEFAUT = process.env.RESEND_FROM_EMAIL ?? "Dépôt Malin <notifications@depotmalin.fr>";

export async function envoyerEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[email non envoyé — RESEND_API_KEY absent] À: ${params.to} — Sujet: ${params.subject}`);
    return { envoye: false as const };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: EXPEDITEUR_PAR_DEFAUT,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      console.error("Échec d'envoi d'email Resend :", await response.text());
      return { envoye: false as const };
    }

    return { envoye: true as const };
  } catch (err) {
    console.error("Erreur réseau lors de l'envoi d'email :", err);
    return { envoye: false as const };
  }
}
