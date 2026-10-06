import { TitreAvecMalin } from "@/components/Malin";
export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <TitreAvecMalin titre="Contact" pose="assistance" />
      <p className="mt-4 text-gray-600">Formulaire de contact à implémenter.</p>
    </main>
  );
}
