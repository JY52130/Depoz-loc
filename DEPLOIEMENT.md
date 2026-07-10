# Guide de déploiement — DepozLoc

Ce guide part du principe que vous n'avez encore aucun compte créé
(Supabase, GitHub, Vercel, Stripe). Sautez les étapes déjà faites si vous
en avez déjà. Objectif : un premier déploiement fonctionnel en **mode test
Stripe**, sur un sous-domaine `*.vercel.app` (pas de nom de domaine requis
pour démarrer).

Le code est déjà initialisé en dépôt Git local (1 commit) — il ne reste
qu'à le pousser vers un dépôt distant.

---

## 1. Supabase (base de données + auth + storage)

1. Créez un compte sur https://supabase.com puis un nouveau projet
   (région **Europe** de préférence, ex. `eu-central-1`).
2. Notez le mot de passe de base de données choisi à la création.
3. **Activez PostGIS** : Database → Extensions → recherchez `postgis` →
   Enable. (Nécessaire pour la recherche géolocalisée.)
4. **Créez deux buckets Storage publics** : Storage → New bucket →
   - `annonces-photos` (public)
   - `etats-des-lieux` (public)
5. Récupérez les informations de connexion :
   - Project Settings → API : `Project URL` (→ `NEXT_PUBLIC_SUPABASE_URL`),
     `anon public key` (→ `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `service_role
     key` (→ `SUPABASE_SERVICE_ROLE_KEY`, à garder secret).
   - Project Settings → Database → Connection string :
     - Mode **Transaction pooler** (port 6543) → `DATABASE_URL`
     - Mode **Session/direct** (port 5432) → `DIRECT_URL`

## 2. Dépôt GitHub

```bash
# Depuis le dossier du projet (déjà initialisé en Git)
git remote add origin https://github.com/<votre-compte>/depozloc.git
git branch -M main
git push -u origin main
```

Si vous n'avez pas encore de dépôt : créez-en un vide sur GitHub (sans
README ni .gitignore, pour éviter les conflits) puis lancez les commandes
ci-dessus.

## 3. Stripe (mode test)

1. Créez un compte sur https://stripe.com (le mode test est actif par
   défaut, aucune vérification d'identité n'est requise pour commencer).
2. Activez **Connect** : Dashboard → Connect → Paramètres → activez les
   comptes **Express**.
3. Récupérez les clés de test : Développeurs → Clés API →
   `Clé secrète` (→ `STRIPE_SECRET_KEY`, commence par `sk_test_`) et
   `Clé publiable` (→ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `pk_test_`).
4. Le webhook sera configuré à l'étape 5 (il faut d'abord connaître l'URL
   de production).

## 4. Anthropic & Resend (optionnels au démarrage)

- `ANTHROPIC_API_KEY` : console.anthropic.com → API Keys. Sans cette clé,
  l'estimation IA de la caution bascule automatiquement en saisie
  manuelle (aucun blocage).
- `RESEND_API_KEY` : resend.com → API Keys. Sans cette clé, les emails
  transactionnels sont simplement journalisés (logs Vercel) au lieu
  d'être envoyés — utile pour tester sans spammer de vraies boîtes mail.

## 5. Déploiement Vercel

1. Créez un compte sur https://vercel.com et connectez votre compte
   GitHub.
2. **Add New → Project** → importez le dépôt `depozloc`. Vercel détecte
   automatiquement Next.js (build command `next build`, aucune
   configuration à changer).
3. Avant de cliquer sur Deploy, ouvrez **Environment Variables** et
   renseignez toutes les variables de `.env.example` :
   - Toutes les valeurs Supabase (étape 1)
   - `DATABASE_URL`, `DIRECT_URL` (étape 1)
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (étape 3)
   - `STRIPE_WEBHOOK_SECRET` : laissez vide pour l'instant, on le
     complètera juste après.
   - `ANTHROPIC_API_KEY`, `RESEND_API_KEY` si vous les avez (étape 4)
   - `NEXT_PUBLIC_SITE_URL` : laissez `https://depozloc.fr` pour l'instant,
     à corriger juste après le premier déploiement (voir étape 6).
   - `ADMIN_EMAIL`, `RESEND_FROM_EMAIL` : valeurs de votre choix.
4. Cliquez sur **Deploy**. Le premier build peut échouer ou réussir avec
   une base de données vide (pas encore de schéma) — c'est normal, on
   corrige à l'étape suivante.

## 6. Après le premier déploiement

1. Récupérez l'URL attribuée par Vercel (ex.
   `https://depozloc-xxxx.vercel.app`).
2. Mettez à jour la variable d'environnement `NEXT_PUBLIC_SITE_URL` sur
   Vercel avec cette URL exacte, puis **redéployez**
   (Deployments → ⋯ → Redeploy).
3. **Appliquez le schéma de base de données**, depuis votre machine :
   ```bash
   # Dans le dossier du projet, avec un fichier .env local pointant vers
   # les VRAIES valeurs DATABASE_URL/DIRECT_URL de Supabase (étape 1)
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. **Configurez le webhook Stripe** : Dashboard Stripe → Développeurs →
   Webhooks → Add endpoint → URL :
   `https://<votre-url-vercel>/api/webhooks/stripe`, événements à
   sélectionner : `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `account.updated`. Copiez le
   **Signing secret** affiché dans `STRIPE_WEBHOOK_SECRET` sur Vercel, puis
   redéployez.
5. **Créez votre premier compte admin** : inscrivez-vous normalement sur
   le site déployé, puis dans Supabase (Table Editor → `User` ou via SQL) :
   ```sql
   UPDATE "User" SET "estAdmin" = true WHERE email = 'vous@exemple.fr';
   ```

## 7. Checklist de test de bout en bout

- [ ] Inscription / connexion.
- [ ] Création d'une annonce → apparaît dans `/admin/utilisateurs-annonces`
      en attente de modération → approuver → visible publiquement.
- [ ] Recherche par catégorie, page catégorie×ville.
- [ ] Réservation depuis un second compte (locataire) → onboarding Stripe
      Connect du propriétaire si pas encore fait.
- [ ] Paiement avec une [carte de test Stripe](https://docs.stripe.com/testing)
      (ex. `4242 4242 4242 4242`, toute date future, tout CVC).
- [ ] Vérifier la réception du webhook (Stripe Dashboard → Webhooks →
      logs) et le passage du statut de réservation à `EN_COURS`.
- [ ] Messagerie entre les deux comptes.
- [ ] État des lieux d'entrée puis de sortie (upload photo).
- [ ] Clôture (confirmation propriétaire) → vérifier le `Transfer` dans
      Stripe Dashboard → Connect → Transfers.
- [ ] Avis mutuel après clôture.
- [ ] Ouverture d'un litige de test → résolution depuis
      `/admin/litiges`.
- [ ] Export CSV depuis `/admin/finances`.

## 8. Nom de domaine (quand vous en aurez un)

Vercel → Project Settings → Domains → ajoutez votre domaine, suivez les
instructions DNS. Une fois actif, mettez à jour `NEXT_PUBLIC_SITE_URL`
avec le domaine définitif et redéployez (impacte les metadata SEO, le
sitemap, et les URLs de retour Stripe/Capacitor).

## 9. Passage en mode Stripe live (plus tard)

1. Dashboard Stripe → activez le compte (informations légales de
   l'entreprise, vérification d'identité).
2. Activez Stripe Connect en mode live.
3. Remplacez les clés `sk_test_`/`pk_test_` par les clés live
   (`sk_live_`/`pk_live_`) sur Vercel, recréez un webhook en mode live
   avec sa propre signing secret.
4. Testez à nouveau l'intégralité de la checklist ci-dessus avec de vrais
   moyens de paiement avant d'ouvrir au public.
