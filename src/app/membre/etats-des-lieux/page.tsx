import Link from "next/link";

export const metadata = { title: "États des lieux" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">États des lieux</h1>
      <p className="mt-2 text-gray-600">
        Les états des lieux se font depuis la page de chaque location : prenez
        des photos de l&apos;objet à la remise et au retour. Retrouvez vos
        locations dans{" "}
        <Link href="/membre/mes-locations" className="underline">Mes locations</Link>{" "}
        et{" "}
        <Link href="/membre/mes-biens-loues" className="underline">Mes biens loués</Link>.
      </p>
    </div>
  );
}
