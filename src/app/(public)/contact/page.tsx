import Link from "next/link";
import { TitreAvecMalin } from "@/components/Malin";
import { FormulaireContact } from "@/components/FormulaireContact";

export const metadata = {
  title: "Contact",
  description: "Une question sur Dépôt Malin ? Écrivez-nous, notre équipe vous répond par e-mail.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <TitreAvecMalin titre="Contact" pose="contact" />
      <p className="mt-4 text-gray-700">
        Une question, un souci ? Avant d&apos;écrire, jetez un œil à la{" "}
        <Link href="/faq" className="font-medium text-brand underline hover:text-brand-dark">
          foire aux questions
        </Link>
        . Pour un problème sur une location en cours, signalez-le plutôt depuis la page de votre réservation : c&apos;est
        plus rapide.
      </p>
      <FormulaireContact />
    </main>
  );
}
