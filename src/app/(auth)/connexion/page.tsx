import { Logo } from "@/components/Logo";
import { connexion } from "../actions";

export const metadata = {
  title: "Connexion — Dépôt Malin",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-brand-50 to-white px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-sm rounded-2xl border bg-white p-8 shadow-lg shadow-brand/5">
      <h1 className="mb-6 text-2xl font-bold">Connexion</h1>

      {params.erreur && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <form action={connexion} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={params.redirect ?? ""} />
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="rounded-lg border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Se connecter
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <a href="/inscription" className="underline">
          Créer un compte
        </a>
      </p>
      </div>
    </main>
  );
}
