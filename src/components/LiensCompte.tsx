"use client";

// Liens de compte de l'en-tête : « Connexion » et « Créer un compte » pour un
// visiteur, « Mon espace » pour un membre connecté. La session est lue dans le
// navigateur pour que les pages publiques restent statiques (pas de cookies
// lus côté serveur).
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiensCompte() {
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setConnecte(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_evenement, session) => setConnecte(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (connecte) {
    return (
      <Link
        href="/membre/tableau-de-bord"
        className="rounded-lg bg-brand px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-dark"
      >
        Mon espace
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/connexion"
        className="hidden rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 sm:block"
      >
        Connexion
      </Link>
      <Link
        href="/inscription"
        className="rounded-lg bg-brand px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-dark"
      >
        Créer un compte
      </Link>
    </>
  );
}
