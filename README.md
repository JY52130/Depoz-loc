# DepozLoc — V1 complète (Phase 1 à 6)

Marketplace de location d'objets entre particuliers et professionnels, en
France métropolitaine. Voir `DEPOT-MALIN_Base-de-connaissance.md` (fourni
séparément) pour le cahier des charges complet (nom de marque devenu
« DepozLoc » depuis la Phase 1, cf. renommage).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase : Postgres + PostGIS + Auth + Storage
- Prisma (ORM sur la base Postgres de Supabase)
- Estimation IA de la caution : API Anthropic (Claude)
- Géocodage : API Adresse du gouvernement français (gratuite, sans clé)
- Stripe Connect (comptes Express, paiements, caution, commissions)
- Resend (emails transactionnels, via l'API HTTP)

## Livré en Phase 1 (Fondations)

- Projet Next.js initialisé (TypeScript, Tailwind, App Router, `src/`).
- Modèle de données complet dans `prisma/schema.prisma` (section 10).
- Authentification par email/mot de passe via Supabase Auth, middleware
  protégeant `/membre` et `/admin`.
- Squelette de toutes les pages de la section 7 (public, légal RGPD,
  espace membre, back-office).
- Socle SEO : metadata, sitemap/robots dynamiques, helper `JsonLd`.

## Livré en Phase 2 (Annonces & recherche)

- **Catégories** : `src/lib/categories.ts` (12 catégories validées) +
  `prisma/seed.ts` (peuple `Category` et le point relais de Haute-Marne —
  lancer avec `npx prisma db seed`).
- **Logique métier pure et testée** :
  - `src/lib/caution.ts` — coefficients de vétusté (section 9.2).
  - `src/lib/tarifs.ts` — combinaison de paliers la moins chère pour une
    plage de dates donnée (section 9.1), par programmation dynamique.
  - Vérifiables sans base de données : `npx tsx scripts/test-lib.ts`.
- **Estimation IA de la caution** : `src/lib/ai/estimerPrixNeuf.ts` (appel
  Claude via `ANTHROPIC_API_KEY`), exposée via la route
  `POST /api/estimation-caution`. Repli propre si la clé est absente ou
  l'appel échoue (saisie manuelle).
- **Géocodage** : `src/lib/geocodage.ts`, adresse → lat/lng via l'API
  Adresse (data.gouv.fr), limité à la France.
- **Création d'annonce** (`/membre/mes-annonces/nouvelle`) : formulaire
  complet — catégorie, localisation, upload photos (Supabase Storage),
  tarifs par palier, calendrier de disponibilité, caution (IA + repli
  manuel, éditable), attestation sur l'honneur, mode(s) de remise.
  Server action `creerAnnonce` (recalcule la caution côté serveur, ne fait
  pas confiance au client).
- **Recherche** (`/recherche`) : filtres classiques (catégorie, ville,
  prix, mode de remise, texte libre) via Prisma, **+ recherche
  géolocalisée "à proximité" via une requête PostGIS brute**
  (`ST_DWithin`/`ST_Distance`) quand `lat`/`lng`/`rayon` sont fournis.
- **Fiche annonce** (`/annonce/[slug]`) connectée aux vraies données,
  JSON-LD `Product`/`Offer` réel.
- **Pages SEO catégorie et catégorie×ville** : `generateStaticParams` +
  `revalidate = 3600` (ISR), données réelles issues de Prisma.
- **Sitemap** enrichi dynamiquement avec catégories, catégorie×ville et
  annonces en ligne.

## Livré en Phase 3 (Réservation & paiements)

- **Anti-chevauchement** (`src/lib/reservations.ts`, section 9.3) : une
  réservation ne peut être créée que si aucune réservation existante
  (statut non annulé) ne chevauche les dates demandées.
- **Création de réservation** (`src/app/reservation/actions.ts`) depuis un
  nouveau formulaire sur la fiche annonce (`ReserverForm`, aperçu de prix en
  direct) : calcule le prix via `calculerPrixLocation`, les commissions
  (5 % / 10 %), les frais point relais (forfait placeholder de 5 €, section
  17 point 5 — montant à confirmer), crée le `Booking` (statut `RESERVEE`).
- **Stripe Connect (comptes Express)** : onboarding propriétaire
  (`src/app/membre/portefeuille/actions.ts`, bouton dans le Portefeuille),
  via Account Link Stripe hébergé.
- **Paiement locataire** : `PaymentIntent` créé à la réservation, encaissé
  intégralement sur le compte plateforme (séquestre — section 4.2), page
  `/reservation/[bookingId]/paiement` avec Stripe Elements
  (`PaiementForm`), confirmation sur `/reservation/[bookingId]/confirmation`.
- **Caution** : `SetupIntent` créé en parallèle du paiement ; confirmé
  automatiquement (moyen de paiement attaché) une fois le paiement réussi,
  via le webhook — prêt pour un débit off-session en cas de dommage
  (Phase 4).
- **Webhook Stripe** (`/api/webhooks/stripe`) : `payment_intent.succeeded`
  (Booking → `EN_COURS`, confirmation du SetupIntent),
  `payment_intent.payment_failed`, `account.updated` (met à jour
  `stripeOnboardingDone`).
- **Reversement propriétaire** (`src/lib/stripe/reverserProprietaire.ts`) :
  fonction prête à l'emploi (Transfer Stripe du net après commission), à
  brancher sur la validation de l'état des lieux de retour en Phase 4 — non
  appelée nulle part pour l'instant.
- **Portefeuille connecté** (`/membre/portefeuille`) : statut d'onboarding
  (avec vérification de secours via l'API Stripe si le webhook n'est pas
  encore configuré), liste des locations avec montant net attendu/reversé.
- **Mes locations connecté** (`/membre/mes-locations`) : liste réelle des
  réservations du locataire, avec accès direct au paiement si en attente.

## Configuration Stripe à faire de votre côté

1. Créer un compte Stripe (mode test pour commencer) et activer **Stripe
   Connect** (Connect > Paramètres > activer les comptes Express).
2. Renseigner `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   dans `.env` (Dashboard > Développeurs > Clés API).
3. Configurer le webhook : Dashboard > Développeurs > Webhooks > Ajouter un
   endpoint → `https://votre-domaine/api/webhooks/stripe` (ou, en local,
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`) avec les
   événements `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `account.updated`. Copier le signing secret dans
   `STRIPE_WEBHOOK_SECRET`.

## Livré en Phase 4 (Confiance & échanges)

- **Hub réservation** (`/membre/reservations/[bookingId]`) : page centrale
  regroupant messagerie, états des lieux, clôture, avis et litige pour une
  réservation donnée, accessible depuis « Mes locations » et « Mes biens
  loués ».
- **Messagerie interne** : une `Conversation` est créée automatiquement à la
  réservation (`src/app/reservation/actions.ts`). Liste dans
  `/membre/messagerie`, échange de messages sur la page de détail
  (`MessagerieBox`, action `envoyerMessage`).
- **États des lieux** (`EtatDesLieuxSection`) : upload de photos horodatées
  (bucket Supabase Storage `etats-des-lieux`, à créer comme
  `annonces-photos`) + notes, pour l'entrée et la sortie, par chaque partie.
  Le dépôt d'un état des lieux de sortie fait passer la réservation en
  `RETOURNEE`.
- **Clôture** (`ClotureSection`, action `validerRetourSansDommage`) : le
  propriétaire confirme l'absence de dommage → appelle enfin
  `reverserProprietaire()` (écrite en Phase 3) → `Transfer` Stripe réel +
  passage en `CLOTUREE`. Email de notification aux deux parties.
- **Avis mutuels** (`AvisSection`, action `creerAvis`) : possibles une fois
  `CLOTUREE`, recalcul automatique de `User.noteMoyenne`. Page
  `/membre/avis` connectée (reçus/donnés).
- **Litige** (`DisputeSection`, action `ouvrirLitige`) : ouvrable entre la
  remise et la clôture, passe le `Booking` en `LITIGE`, email à l'autre
  partie + à l'équipe (`ADMIN_EMAIL`). Traitement **par email** en V1
  (section 6.6).
- **Back-office `/admin/litiges` connecté** : liste des litiges, résolution
  avec retenue de caution (`src/lib/stripe/resoudreLitige.ts` — débit
  off-session de la carte via le SetupIntent, reversement du loyer net +
  de la caution retenue au propriétaire). ⚠️ Pas encore de contrôle de rôle
  admin (voir plus bas).
- **Notifications email** (`src/lib/email/`) : wrapper Resend
  (`envoyerEmail.ts`, repli en simple log si `RESEND_API_KEY` absent) +
  modèles (`notifications.ts`) branchés sur paiement reçu (webhook),
  clôture, et ouverture de litige.

## Buckets Supabase Storage à créer

En plus de `annonces-photos` (Phase 2), créez un second bucket **public**
nommé `etats-des-lieux` pour les photos d'état des lieux.

## Livré en Phase 5 (Point relais & back-office)

- **Contrôle de rôle admin** : nouveau champ `User.estAdmin` (schema). Le
  layout `src/app/admin/layout.tsx` vérifie ce champ et renvoie un 404 aux
  membres non admin (avant, `/admin/*` n'était protégé que par la connexion).
  **Aucune UI ne permet de se promouvoir admin** — voir plus bas pour créer
  le premier compte admin.
- **Modération des annonces** : nouveau statut `EN_ATTENTE_MODERATION`
  (défaut à la création, au lieu de `EN_LIGNE` directement). File de
  modération dans `/admin/utilisateurs-annonces` (approuver / rejeter),
  liste des annonces en ligne (suspendre), liste des utilisateurs récents.
- **Gestion du point relais** (`/admin/point-relais`) : suit chaque
  réservation en circuit point relais à travers les statuts `RelayStock`
  (déposé par le propriétaire → retiré par le locataire → retourné), crée
  les `ConditionReport` (`auteurType = STAFF`) à l'entrée et à la sortie, et
  permet au personnel de confirmer l'absence de dommage pour déclencher la
  clôture (le propriétaire ne le fait plus lui-même dans ce circuit, faute
  de contact direct — voir section 5.2). Le hub réservation
  (`/membre/reservations/[bookingId]`) adapte son affichage en conséquence.
- **Back-office finances** (`/admin/finances`) : total encaissé, commissions
  plateforme, montant reversé aux propriétaires, cautions retenues (litiges),
  table des transactions, **export CSV** (`/admin/finances/export` — contrôle
  admin répété explicitement car les Route Handlers ne passent pas par le
  layout React).

### Créer le premier compte admin

Il n'y a volontairement aucune UI pour ça (surface d'attaque). Une fois
connecté au moins une fois (pour que la ligne `User` existe), passez par
Prisma Studio (`npx prisma studio`) ou en SQL :

```sql
UPDATE "User" SET "estAdmin" = true WHERE email = 'vous@exemple.fr';
```

## Livré en Phase 6 (SEO avancé, RGPD, AdSense, mobile)

- **Bandeau de consentement (CMP)** : `ConsentementBanner` (client),
  cookie `depozloc_consentement` (6 mois). Le consentement est vérifié
  **côté client** (`document.cookie`), volontairement, pour ne pas forcer
  le rendu dynamique des pages publiques — un premier essai avec une
  lecture côté serveur (`next/headers`) avait fait perdre le rendu statique
  (SSG/ISR) de la quasi-totalité des pages publiques ; corrigé avant
  livraison.
- **Google AdSense** conditionné au consentement (`AdSenseLoader`,
  `AdSlot`), emplacements sur l&apos;accueil, les pages catégorie et la fiche
  annonce. Nécessite `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
- **Données structurées complètes** : `Organization` + `WebSite`/`SearchAction`
  (accueil), `LocalBusiness` par point relais, `BreadcrumbList` (fiche
  annonce + catégorie×ville), `FAQPage` (FAQ, avec un premier contenu réel),
  en plus de `Product`/`Offer` déjà en place.
- **Pages légales étoffées** : confidentialité, cookies, CGU, CGV, mentions
  légales — contenu substantiel mais **à faire valider par un juriste**
  (bandeau d&apos;avertissement visible sur chaque page).
- **Encapsulation mobile (Capacitor)** : `@capacitor/core` + `@capacitor/cli`
  installés, `capacitor.config.ts` en mode webview (l&apos;app native affiche
  le site déployé, aucun export statique séparé). L&apos;ajout des plateformes
  (`npx cap add ios` / `android`) nécessite Xcode / Android Studio, non
  disponibles dans cet environnement de build — à faire sur votre machine.
- **Performance** : migration des photos vers `next/image` (annonces,
  états des lieux) avec `remotePatterns` pour Supabase Storage ; suppression
  de la dépendance à Google Fonts (police système) déjà faite en Phase 1.

### Mettre en place l'app mobile (à faire chez vous)

```bash
npm install
npx cap add ios       # nécessite Xcode (macOS)
npx cap add android    # nécessite Android Studio
npx cap sync
npx cap open ios       # ou: npx cap open android
```

Pensez à mettre à jour `NEXT_PUBLIC_SITE_URL` (utilisé aussi par
`capacitor.config.ts`) avec l&apos;URL de production avant de builder les apps.

## Démarrer en local

1. **Créer un projet Supabase** (https://supabase.com) : région Europe de
   préférence. Activer l'extension **PostGIS** (Database > Extensions).
2. **Créer un bucket Storage public** nommé `annonces-photos` (Storage >
   New bucket, coché "Public") — utilisé par le formulaire de création
   d'annonce pour l'upload des photos.
3. Copier `.env.example` vers `.env` et renseigner :
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API).
   - `DATABASE_URL` (connection string "Transaction pooler", port 6543) et
     `DIRECT_URL` (connection string directe, port 5432) — Project Settings >
     Database > Connection string.
   - `ANTHROPIC_API_KEY` pour activer l'estimation IA de la caution (sinon
     repli automatique en saisie manuelle).
4. Installer les dépendances :
   ```bash
   npm install
   ```
5. Générer le client Prisma et appliquer le schéma :
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   > Remarque : ces commandes n'ont pas pu être exécutées dans
   > l'environnement de build (accès réseau restreint vers
   > `binaries.prisma.sh`). Le schéma a été vérifié manuellement
   > (syntaxe équilibrée) et l'ensemble du code applicatif a été
   > type-checké/buildé avec un client Prisma factice de vérification —
   > lancez `npx prisma validate` sur votre machine avant la première
   > migration.
6. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
7. Ouvrir http://localhost:3000. Créez un compte, puis publiez une
   première annonce depuis `/membre/mes-annonces/nouvelle`.

## Vérifications effectuées dans cet environnement

- `npm run lint` : aucune erreur.
- `npm run build` : build complet réussi (36 routes générées), y compris
  les pages SSG catégorie/catégorie×ville et l'API de génération de
  sitemap/robots.
- `npx tsx scripts/test-lib.ts` : logique de caution et de tarification
  vérifiée par des assertions.
- Le build ci-dessus a été réalisé avec un client Prisma factice (aucun
  accès réseau vers `binaries.prisma.sh` dans cet environnement) : la
  vérification porte sur la structure du code (typage, JSX, routing), pas
  sur le comportement réel des requêtes Prisma. À revalider avec
  `npm run build` une fois `npx prisma generate` exécuté avec votre vraie
  base.

## V1 — bilan

Les 6 phases du plan initial sont livrées. Avant une mise en production
réelle, voir la section suivante pour la liste des points encore ouverts
(non bloquants pour continuer le développement, mais à trancher/tester
avant le lancement).

## Points ouverts avant mise en production (consolidé)

- **Caution longue durée** : SetupIntent + débit off-session en place, mais
  la durée réelle de validité d'un moyen de paiement enregistré et la
  fiabilité du débit off-session selon les banques/réseaux restent à tester
  en conditions réelles (section 11.1).
- **Plancher minimum de caution** : 20 € par défaut (`src/lib/caution.ts`,
  `PLANCHER_MINIMUM_CAUTION`) — à confirmer.
- **Durées de palier** : hypothèse 1 semaine = 7 jours, 1 mois = 30 jours
  (`src/lib/tarifs.ts`) — à confirmer.
- **Frais point relais** : montant placeholder de 5 €
  (`src/lib/constantesReservation.ts`) — à confirmer (section 17, point 5).
- **Obligations pro** (facturation, TVA) : V1 minimale (SIRET + mention
  "pro"), à affiner si besoin (section 3.3).
- **Annulation de réservation** : pas de flux d'annulation/remboursement
  (Stripe refund) — à construire.
- **Qui valide la clôture (P2P)** : le propriétaire confirme l'absence de
  dommage après inspection. À confirmer si un délai automatique (ex. 48h
  sans litige) doit être ajouté en complément.
- **Rôle admin vs staff point relais** : un seul niveau (`User.estAdmin`)
  donne accès à tout le back-office — à affiner si un rôle staff restreint
  est nécessaire.
- **Modération** : décisions binaires (approuver/rejeter), sans motif de
  rejet transmis au propriétaire ni email dédié — à enrichir.
- **Point relais** : un seul site géré (conforme V1), le code suppose
  `RelayPoint.findFirst()` — à revoir en cas de multi-locaux (hors
  périmètre V1, section 16).
- **Pages légales** : contenu substantiel mais générique — à faire valider
  par un juriste avant mise en production (section 13.2).
- **Build Prisma** : `prisma generate` / `migrate` / `db seed` n'ont pas pu
  tourner dans cet environnement (réseau restreint vers
  `binaries.prisma.sh`) — à exécuter sur votre machine avant le premier
  `npm run dev`.
