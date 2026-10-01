import { Logo } from "@/components/Logo";
import { inscription } from "../actions";

export const metadata = {
  title: "Créer un compte — Dépôt Malin",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-brand-50 to-white px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-sm rounded-2xl border bg-white p-8 shadow-lg shadow-brand/5">
      <h1 className="mb-6 text-2xl font-bold">Créer un compte</h1>

      {params.erreur && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.erreur}
        </p>
      )}

      <form action={inscription} className="flex flex-col gap-4">
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
          Créer mon compte
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Le statut particulier/professionnel sera choisi lors de votre première
        mise en location.
      </p>

      <p className="mt-2 text-sm text-gray-600">
        Déjà un compte ? <a href="/connexion" className="underline">Se connecter</a>
      </p>
      </div>
    </main>
  );
}
