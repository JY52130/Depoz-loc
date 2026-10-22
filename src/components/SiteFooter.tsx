import Link from "next/link";
import { LogoIcone } from "@/components/Logo";

// Pied de page (refait le 22 octobre 2026, inspiré de NousLouons) :
// - les locations les plus demandées, par grand thème (liens vers la
//   recherche : utile aux visiteurs et au référencement) ;
// - les communes autour de Saint-Dizier ;
// - aide, informations légales, réseaux sociaux et application ;
// - les garanties de Dépôt Malin, que Leboncoin n'offre pas.

const LOCATIONS_DEMANDEES: { titre: string; categorie: string; objets: string[] }[] = [
  { titre: "Bricolage", categorie: "outillage-bricolage", objets: ["Perceuse", "Ponceuse", "Échelle", "Shampouineuse"] },
  { titre: "Jardin", categorie: "jardinage-exterieur", objets: ["Tondeuse", "Taille-haie", "Nettoyeur haute pression", "Broyeur"] },
  { titre: "Fêtes et réceptions", categorie: "evenementiel-reception", objets: ["Tonnelle", "Tables et chaises", "Sono", "Machine à raclette"] },
  { titre: "Sport et plein air", categorie: "sport-loisirs", objets: ["Vélo", "Tente", "Paddle", "Glacière"] },
  { titre: "Bébé et enfant", categorie: "bebe-enfant", objets: ["Poussette", "Lit parapluie", "Siège auto", "Chaise haute"] },
  { titre: "Auto et vélo", categorie: "auto-moto-velo", objets: ["Remorque", "Coffre de toit", "Porte-vélos", "Barres de toit"] },
];

// Saint-Dizier et les communes à moins de 20 km environ.
const COMMUNES = [
  "Saint-Dizier",
  "Ancerville",
  "Bettancourt-la-Ferrée",
  "Chancenay",
  "Eurville-Bienville",
  "Hallignicourt",
  "Perthes",
  "Wassy",
];

const liensAide = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/pourquoi-louer", label: "Pourquoi louer ?" },
  { href: "/tarifs", label: "Tarifs & commissions" },
  { href: "/points-relais", label: "Commerçants relais" },
  { href: "/annoncer", label: "Annoncer sur Dépôt Malin" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const liensLegaux = [
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/contrat-de-location", label: "Contrat de location" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

// Les liens s'affichent dès que l'adresse de la page est renseignée dans
// Vercel (variables NEXT_PUBLIC_FACEBOOK_URL et NEXT_PUBLIC_INSTAGRAM_URL).
const RESEAUX = [
  { nom: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { nom: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
].filter((r): r is { nom: string; url: string } => Boolean(r.url));

const GARANTIES = [
  "Paiement sécurisé par Stripe",
  "Caution sans avance d'argent",
  "Contrat et état des lieux",
  "Identité vérifiée",
];

const lien = "hover:text-white hover:underline";
const titreColonne = "text-sm font-semibold text-white";

const rechercher = (parametres: Record<string, string>) => `/recherche?${new URLSearchParams(parametres)}`;

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-gray-300">
      <section aria-labelledby="titre-locations-demandees" className="mx-auto max-w-6xl px-4 pt-12">
        <h2 id="titre-locations-demandees" className="text-base font-semibold text-white">
          Les locations les plus demandées
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {LOCATIONS_DEMANDEES.map((groupe) => (
            <div key={groupe.categorie}>
              <h3 className={titreColonne}>{groupe.titre}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {groupe.objets.map((objet) => (
                  <li key={objet}>
                    <Link href={rechercher({ q: objet })} className={lien}>
                      Location {objet.toLowerCase()}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/location/${groupe.categorie}`} className="font-medium text-brand-100 hover:text-white hover:underline">
                    Voir tout<span className="sr-only"> : {groupe.titre}</span>
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="titre-communes" className="mx-auto max-w-6xl px-4 pt-10">
        <h2 id="titre-communes" className={titreColonne}>
          Louer près de chez vous
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {COMMUNES.map((commune) => (
            <li key={commune}>
              <Link href={rechercher({ ville: commune })} className={lien}>
                {commune}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto mt-10 grid max-w-6xl gap-10 border-t border-white/10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoIcone taille={32} />
            <span className="text-lg font-extrabold tracking-tight text-white">
              Dépôt <span className="text-brand-100">Malin</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-gray-400">
            Louer plutôt qu&apos;acheter, entre voisins. Le site de location d&apos;objets de Saint-Dizier et
            alentour.
          </p>
        </div>
        <nav aria-labelledby="titre-aide">
          <h2 id="titre-aide" className={titreColonne}>
            Aide
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {liensAide.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={lien}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="titre-legal">
          <h2 id="titre-legal" className={titreColonne}>
            Informations légales
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {liensLegaux.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={lien}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className={titreColonne}>Restons en contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/contact" className={lien}>
                Écrire à l&apos;équipe
              </Link>
            </li>
            {RESEAUX.map((r) => (
              <li key={r.nom}>
                <a href={r.url} className={lien} target="_blank" rel="noopener noreferrer">
                  {r.nom}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
            <li>
              <Link href="/application" className={lien}>
                Installer l&apos;application
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
          <ul aria-label="Nos garanties" className="flex flex-wrap gap-x-4 gap-y-1">
            {GARANTIES.map((g) => (
              <li key={g}>
                <span aria-hidden="true" className="text-brand-100">
                  ✓{" "}
                </span>
                {g}
              </li>
            ))}
          </ul>
          <p>© {new Date().getFullYear()} Dépôt Malin. Fait avec soin à Saint-Dizier.</p>
        </div>
      </div>
    </footer>
  );
}
