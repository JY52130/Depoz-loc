import { connexion } from "../actions";

export const metadata = {
  title: "Connexion — DepozLoc",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Connexion</h1>

      {params.erreur && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
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
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="rounded border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
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
    </main>
  );
}
