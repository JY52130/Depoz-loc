import Link from "next/link";
import { LogoIcone } from "@/components/Logo";
import { CATEGORIES } from "@/lib/categories";

// Pied de page (refait le 22 octobre 2026) :
// - « Un projet ? » : on part du besoin du visiteur (déménager, recevoir…)
//   vers nos catégories, avec un conseil de Malin ;
// - les communes autour de Saint-Dizier ;
// - aide, informations légales, réseaux sociaux et application ;
// - les garanties de Dépôt Malin, que Leboncoin n'offre pas.

const PROJETS: { titre: string; conseil: string; categories: string[] }[] = [
  {
    titre: "Je déménage",
    conseil: "Une remorque pour un week-end coûte bien moins cher qu'un camion.",
    categories: ["auto-moto-velo", "outillage-bricolage", "mobilier-deco"],
  },
  {
    titre: "Je reçois du monde",
    conseil: "Anniversaire, communion, fête des voisins : tout pour accueillir sans rien stocker.",
    categories: ["evenementiel-reception", "image-son"],
  },
  {
    titre: "J'attends un bébé",
    conseil: "Les enfants grandissent vite : louez ce qui ne sert que quelques mois.",
    categories: ["bebe-enfant"],
  },
  {
    titre: "Je pars en vacances",
    conseil: "Camping, rando, coffre de toit : partez équipé sans acheter.",
    categories: ["camping-plein-air", "sport-loisirs"],
  },
  {
    titre: "Je fais des travaux",
    conseil: "Le bon outil pour un chantier ponctuel, chez un voisin.",
    categories: ["outillage-bricolage", "electromenager"],
  },
  {
    titre: "Je m'occupe du jardin",
    conseil: "Gros outils de saison : utilisés deux fois par an, loués deux fois par an.",
    categories: ["jardinage-exterieur"],
  },
];

const nomCategorie = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.nom ?? slug;

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
      <section aria-labelledby="titre-projets" className="mx-auto max-w-6xl px-4 pt-12">
        <h2 id="titre-projets" className="text-base font-semibold text-white">
          Un projet ? Malin a l&apos;objet qu&apos;il vous faut
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJETS.map((projet) => (
            <li key={projet.titre} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className={titreColonne}>{projet.titre}</h3>
              <p className="mt-1 text-sm text-gray-400">{projet.conseil}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {projet.categories.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/location/${slug}`}
                      className="inline-block rounded-full border border-white/20 px-3 py-1 hover:border-white hover:text-white"
                    >
                      {nomCategorie(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
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
