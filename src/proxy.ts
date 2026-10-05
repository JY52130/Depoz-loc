import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Site caché avant le lancement : si la variable SITE_MOT_DE_PASSE est
// définie (Vercel > Settings > Environment Variables), le navigateur demande
// un mot de passe avant d'afficher la moindre page. Supprimer la variable
// pour ouvrir le site au public.
const motDePasseSite = process.env.SITE_MOT_DE_PASSE;

// Appels automatiques (Stripe, tâches planifiées Vercel) : ils ne peuvent pas
// saisir de mot de passe. Chaque route vérifie sa propre clé secrète.
const cheminsSansMotDePasse = ["/api/webhooks/stripe", "/api/cron/"];

function motDePasseCorrect(request: NextRequest): boolean {
  const entete = request.headers.get("authorization");
  if (!entete?.startsWith("Basic ")) return false;
  try {
    const decode = atob(entete.slice(6));
    return decode.slice(decode.indexOf(":") + 1) === motDePasseSite;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (
    motDePasseSite &&
    !cheminsSansMotDePasse.some((p) => request.nextUrl.pathname.startsWith(p)) &&
    !motDePasseCorrect(request)
  ) {
    return new Response("Site en préparation : mot de passe requis.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Depot Malin", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Espace membre et back-office protégés : redirection vers /connexion si non authentifié.
  const protectedPrefixes = ["/membre", "/admin"];
  const isProtected = protectedPrefixes.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return Response.redirect(url);
  }

  if (motDePasseSite) {
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
