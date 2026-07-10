# DÉPÔT MALIN — Base de connaissance & spécifications

> Document de référence unique du projet. Il décrit le **concept**, la **logique métier**, le **front-end**, le **back-end**, le **modèle de données** et la **stratégie SEO**. Il sert de source de vérité pour le développement (Claude Cowork) et pour toute personne rejoignant le projet.
>
> **Version :** 1.0 — cadrage V1
> **Cible :** France métropolitaine · Web responsive encapsulé en app mobile
> **Statut des décisions :** les points encore ouverts sont regroupés en **section 17**. Les hypothèses par défaut retenues y sont signalées « *à confirmer* » dans le texte.

---

## 1. Vision & concept

**Dépôt Malin** est une marketplace de **location d'objets** entre particuliers et professionnels, en France métropolitaine. Un utilisateur met un objet en location ; un autre le recherche, le réserve sur un calendrier, paie en ligne, dépose une caution, puis récupère l'objet en main propre — soit directement auprès du propriétaire, soit via un **point relais** géré par la marque.

Le service doit être **simple, intuitif, performant et optimisé pour le SEO**. Le SEO est un pilier stratégique : une grande partie du trafic doit venir des pages de destination « catégorie × ville » indexées par Google.

Positionnement synthétique : *louer plutôt qu'acheter, près de chez soi, en toute confiance.*

---

## 2. Périmètre V1

### Inclus dans la V1
- Location payante d'objets (pas de troc, vente ou don).
- Compte unique ; statut **particulier** ou **professionnel** choisi au moment de la mise en location.
- Recherche par **catégorie** puis **filtres** (dont géolocalisation).
- Calendrier de disponibilité et de réservation.
- **Caution calculée automatiquement** + attestation sur l'honneur.
- Paiement en ligne + gestion de caution via **Stripe Connect** (séquestre, commissions).
- Deux circuits de remise : **main à main (P2P)** et **point relais** (click & collect, 1 site en Haute-Marne).
- **États des lieux** photo (P2P) ou par le personnel (point relais).
- **Messagerie interne** entre membres.
- **Avis / notation** des utilisateurs via leurs objets.
- **Gestion des litiges** en interne, par email.
- Pages SEO (catégorie et catégorie × ville), pages légales, blog optionnel.
- Monétisation : **commission** (5 % locataire / 10 % propriétaire) + **Google AdSense**.

### Hors périmètre V1 (évolutions prévues — voir roadmap section 16)
- Livraison / expédition (V1 = main propre uniquement).
- Vérification d'identité (pièce d'identité).
- Système d'**assurance** des objets (envisagé).
- **Liste de repli** des cautions par équipement (si l'IA ne trouve pas le prix).
- Multi-locaux / réseau de points relais.
- Gestion des litiges via un module dédié (V1 = email).

---

## 3. Utilisateurs, rôles & statuts

### 3.1 Un seul type de compte
Tous les membres s'inscrivent de la même manière. Le **statut** (particulier / professionnel) est un **attribut du profil**, choisi au moment de la **première mise en location**, pas un parcours d'inscription séparé.

### 3.2 Rôles fonctionnels (non exclusifs)
Un même compte peut cumuler les rôles :
- **Propriétaire (loueur)** : met des objets en location.
- **Locataire** : réserve et loue des objets.
- **Administrateur / staff** : back-office, modération, gestion du point relais, litiges.

### 3.3 Statuts propriétaire

| Attribut | Particulier | Professionnel |
|---|---|---|
| Vérification SIRET | Non | **Oui** (obligatoire) |
| Gestion TVA | Non | **Oui** |
| Facturation | Reçu simple | **Facture conforme** |
| Volumes | Usage personnel | Illimité / pro |

> *À confirmer :* le détail des obligations pro (mentions de facture, TVA applicable, statut micro-entrepreneur vs société) sera précisé au build. En V1, on collecte au minimum le **SIRET** et on marque le compte comme « pro » pour la facturation et l'affichage.

---

## 4. Modèle économique & flux financiers

### 4.1 Sources de revenus
1. **Commission sur transaction** : **5 %** côté locataire + **10 %** côté propriétaire (soit **15 %** du montant de location perçus par la plateforme).
2. **Frais point relais** : frais supplémentaires quand l'objet transite par un local géré (*qui les paie = à confirmer, section 17*).
3. **Publicité Google AdSense** sur les pages publiques.

### 4.2 Principe de séquestre (escrow)
La plateforme **encaisse** le paiement du locataire, **retient les fonds** pendant la location, puis **reverse** au propriétaire (moins commission) **après validation du retour** (état des lieux OK). Réalisé via **Stripe Connect**.

### 4.3 Exemple chiffré (illustratif)
Perceuse louée 3 jours à 15 €/jour = **45 € de location**. Caution auto-calculée = **120 €**.

| Poste | Montant |
|---|---|
| Location | 45,00 € |
| Frais de service locataire (5 %) | + 2,25 € |
| **Total payé par le locataire** | **47,25 €** (débité) |
| Empreinte / caution | 120,00 € (autorisation, non débitée si tout va bien) |
| Commission propriétaire (10 %) | − 4,50 € |
| **Net reversé au propriétaire** | **40,50 €** |
| **Revenu plateforme** | **6,75 €** (2,25 + 4,50) |

### 4.4 Reversement au propriétaire
- Après un retour validé, le net devient **« disponible »** dans le portefeuille du propriétaire.
- Le **versement bancaire (payout)** s'effectue selon une **cadence** (hebdomadaire ou mensuelle) — *cadence à confirmer, section 17* — ou via le calendrier de payout Stripe.

---

## 5. Les deux circuits de location

C'est une distinction structurante : chaque annonce précise le(s) mode(s) de remise accepté(s).

### 5.1 Circuit A — Main à main (P2P) — *mode par défaut*
- Le propriétaire et le locataire conviennent des modalités de remise **via la messagerie**.
- **État des lieux** réalisé **entre les deux parties**, avec **photos** téléversées dans l'app (à la remise et au retour).
- Aucun frais point relais.

### 5.2 Circuit B — Point relais (click & collect) — *option*
- **Option** proposée au propriétaire pour déléguer la gestion et ne pas perdre de temps.
- **1 seul local au lancement**, en **Haute-Marne (52)**.
- Le local devient **point de dépôt ET de retrait** : le propriétaire y dépose l'objet, le locataire vient le récupérer. **Plus de contact direct** propriétaire ↔ locataire.
- **État des lieux réalisé par le personnel** du local, à l'entrée et à la sortie.
- **Frais supplémentaires** appliqués.
- La **plateforme gère** entièrement les objets de ce circuit (stock, entrées/sorties).

---

## 6. Parcours utilisateurs (user flows)

### 6.1 Inscription / connexion
Email + mot de passe (option connexion sociale à évaluer). Profil de base créé. Statut pro/particulier non demandé à ce stade.

### 6.2 Mettre un objet en location (propriétaire)
1. Choix de la **catégorie**.
2. **Photos** + titre + description.
3. Définition des **tarifs par palier** (voir 9.1).
4. **Calendrier de disponibilité** (périodes où l'objet est louable).
5. **Caution auto-calculée** : nom du matériel → estimation prix neuf (IA) + **âge déclaré** → montant proposé (voir 9.2).
6. **Attestation sur l'honneur** de l'exactitude des informations.
7. Choix du **mode de remise** : main à main et/ou point relais.
8. Si première mise en location : choix du **statut** (particulier / pro + SIRET), puis **onboarding Stripe Connect** pour pouvoir être payé.
9. Publication (éventuelle modération).

### 6.3 Louer un objet (locataire)
1. **Recherche** par catégorie → **filtres** (géoloc/distance, dates, prix, mode de remise).
2. Consultation de la **fiche annonce** (photos, tarifs, caution, disponibilités, note du propriétaire).
3. Sélection d'une **plage de dates** → l'objet est **bloqué** sur la période.
4. **Paiement** de la location + frais de service + mise en place de la **caution** (Stripe).
5. **Confirmation** de réservation.
6. **Récupération** : soit au **point relais**, soit **main à main** (modalités via messagerie).

### 6.4 Remise et retour
- **Remise** : état des lieux d'entrée (photos P2P ou personnel au local).
- **Retour** : état des lieux de sortie → **clôture** de la location.
- Si tout est conforme : **libération de la caution** + **reversement** au propriétaire (moins commission).
- Si dommage constaté : ouverture d'un **litige** (voir 6.6).

### 6.5 Avis mutuels
À la clôture, locataire et propriétaire peuvent **se noter mutuellement**. La note du propriétaire s'affiche sur ses annonces.

### 6.6 Litige (V1)
Traité **en interne, par email**. Déclenchable depuis une location. La caution peut être retenue en tout ou partie selon l'issue.

---

## 7. Cartographie des pages (front-end)

### 7.1 Pages publiques (SEO)
- **Accueil** : barre de recherche, catégories mises en avant, réassurance (comment ça marche, avis, points relais).
- **Pages catégorie** (landing SEO) : une par catégorie de 1er niveau.
- **Pages catégorie × ville** (landing SEO) : cœur du trafic organique.
- **Résultats de recherche** : liste + filtres (catégorie, distance, dates, prix, mode de remise) + carte.
- **Fiche annonce** : galerie photos, tarifs par palier, caution, calendrier de disponibilité, profil + note du propriétaire, bouton **Réserver**, mode(s) de remise.
- **Comment ça marche** (côté locataire / côté propriétaire).
- **Nos points relais**.
- **Tarifs & commissions**.
- **Blog** (optionnel, fort levier SEO).
- **FAQ**, **Contact**.
- **Pages légales** : CGU, CGV, mentions légales, politique de confidentialité (RGPD), politique cookies.

### 7.2 Espace membre (connecté)
- **Tableau de bord** (synthèse).
- **Profil public** (note, avis, annonces).
- **Mes annonces** : créer / modifier, calendrier de disponibilité.
- **Mes locations** (locataire) : en cours + historique.
- **Mes biens loués** (propriétaire) : demandes + locations en cours.
- **Messagerie interne**.
- **Portefeuille** : revenus, historique des reversements, onboarding Stripe Connect.
- **Avis** reçus / donnés.
- **États des lieux** (photos entrée/sortie — circuit P2P).
- **Paramètres** : compte, bascule statut pro (SIRET, TVA), moyens de paiement, notifications.

### 7.3 Back-office / Admin
- **Utilisateurs & annonces** : modération.
- **Point relais** : stock, entrées/sorties, états des lieux du personnel.
- **Litiges**.
- **Finances** : commissions, paiements, reversements, exports.

---

## 8. Fonctionnalités détaillées

- **Recherche & filtres** : catégorie → filtres cumulables (distance via géoloc, dates de disponibilité, fourchette de prix, mode de remise). Tri (pertinence, distance, prix). Vue liste + **carte**.
- **Géolocalisation** : recherche « près de chez moi » ; rayon paramétrable ; nécessite le géocodage des annonces et de la position de recherche.
- **Calendrier** : disponibilités côté propriétaire, réservation côté locataire, gestion des conflits (double réservation impossible sur une même plage).
- **Caution automatique** : estimation prix neuf + vétusté → montant ; attestation sur l'honneur.
- **Paiement & caution** : Stripe (voir section 11).
- **Messagerie interne** : conversations liées à une annonce / réservation ; notifications.
- **États des lieux** : upload de photos horodatées (P2P) ou saisie par le personnel (point relais).
- **Avis / notation** : note + commentaire, à la clôture.
- **Notifications** : email (transactionnel) pour les événements clés (réservation, remise, retour, litige, paiement).
- **AdSense** : emplacements publicitaires sur pages publiques, respectant le consentement RGPD.

---

## 9. Logique métier (règles de gestion)

### 9.1 Tarifs par palier
Le propriétaire renseigne **jusqu'à 4 tarifs optionnels** et n'active que ceux qu'il souhaite :
- **Demi-journée**
- **Journée**
- **Semaine**
- **Mois**

> *À confirmer (section 17) :* liste finale des paliers. Hypothèse retenue = ces 4 paliers optionnels. Le calcul du prix total applique la combinaison la plus avantageuse pour le locataire selon les dates choisies (règle de tarification à préciser au build).

### 9.2 Calcul de la caution
Montant = **Prix neuf estimé × coefficient de vétusté** (fonction de l'âge déclaré), avec un **plancher minimum**.

Proposition de coefficients (à ajuster) :

| Âge du matériel | Coefficient |
|---|---|
| < 1 an | 90 % |
| 1 à 3 ans | 70 % |
| 3 à 5 ans | 50 % |
| > 5 ans | 30 % (plancher) |

- **Prix neuf** : estimé via **recherche IA** à partir du nom du matériel.
- **Repli** si l'IA ne trouve pas : en V1, saisie manuelle encadrée ou valeur par défaut ; **liste de référence des cautions = post-V1** (roadmap).
- **Attestation sur l'honneur** obligatoire de l'exactitude des informations transmises (prix, âge, état).

> *À confirmer (section 17) :* l'estimation IA fait-elle partie de la V1, ou démarre-t-on avec une saisie/validation manuelle en attendant ?

### 9.3 Réservation & blocage
- Une réservation confirmée **bloque** l'objet sur la plage choisie.
- Deux réservations ne peuvent pas se chevaucher sur un même objet.
- La caution doit être **validée** (autorisation Stripe réussie) pour que la réservation soit confirmée.

### 9.4 Commissions
- Locataire : **5 %** du montant de location (frais de service).
- Propriétaire : **10 %** du montant de location (prélevé sur le reversement).
- Implémentées via l'**application fee** Stripe Connect + logique de reversement.

### 9.5 Clôture & libération de caution
- Retour + état des lieux conforme → **libération de la caution** + **reversement** au propriétaire (net de commission).
- Dommage / non-retour → **litige** ; retenue partielle ou totale de la caution selon décision interne.

### 9.6 Cadence de reversement
Après validation, le net est **disponible** puis **versé** selon la cadence retenue (hebdo/mensuel — *à confirmer*).

---

## 10. Modèle de données

Entités principales (champs indicatifs, à affiner au build) :

- **User** : id, email, mot de passe (hash), nom, téléphone, statut (`particulier`/`pro`), SIRET (si pro), TVA, note moyenne, id_stripe_account, date_création.
- **Category** : id, nom, slug (SEO), description, ordre.
- **Listing (annonce)** : id, id_propriétaire, id_catégorie, titre, description, photos[], prix_demi_journée, prix_journée, prix_semaine, prix_mois, prix_neuf_estimé, âge_matériel, montant_caution, modes_remise[`p2p`/`point_relais`], géolocalisation (lat, lng, ville, code_postal), statut (`brouillon`/`en_ligne`/`suspendu`), date_création.
- **Availability (disponibilité)** : id, id_annonce, date_début, date_fin (plages où l'objet est louable).
- **Booking (réservation/location)** : id, id_annonce, id_locataire, id_propriétaire, date_début, date_fin, palier_appliqué, montant_location, frais_service_locataire, commission_propriétaire, montant_caution, mode_remise, statut (`réservée`/`en_cours`/`retournée`/`clôturée`/`annulée`/`litige`), date_création.
- **Transaction** : id, id_réservation, id_stripe_payment_intent, id_stripe_setup_intent (caution), application_fee, id_transfer (reversement), statut, montants, dates.
- **ConditionReport (état des lieux)** : id, id_réservation, type (`entrée`/`sortie`), auteur (`propriétaire`/`locataire`/`staff`), photos[], notes, date.
- **Conversation** & **Message** : liées à une annonce/réservation ; expéditeur, contenu, date, lu.
- **Review (avis)** : id, id_réservation, auteur, cible, note (1–5), commentaire, date.
- **RelayPoint (point relais)** : id, nom, adresse, ville, code_postal, géolocalisation, horaires.
- **RelayStock** : id, id_point_relais, id_annonce, id_réservation, statut (`déposé`/`retiré`/`retourné`), dates.
- **Dispute (litige)** : id, id_réservation, ouvert_par, motif, statut, décision, montant_caution_retenu, dates.

Relations clés : un `User` possède plusieurs `Listing` ; un `Listing` a plusieurs `Availability` et `Booking` ; un `Booking` génère `Transaction`, `ConditionReport`, éventuellement `Dispute`, et permet des `Review`.

---

## 11. Intégrations techniques

### 11.1 Stripe Connect (paiements marketplace)
- **Comptes connectés** (Express recommandé) pour les propriétaires ; onboarding intégré.
- **Séquestre** : encaissement sur le compte plateforme, **reversement différé** au propriétaire après retour validé (separate charges & transfers, ou destination charge avec logique de hold).
- **Commissions** via `application_fee` (part plateforme).
- **Caution** : ⚠️ une autorisation manuelle (empreinte) ne tient qu'environ **7 jours** sur carte — insuffisant pour une location au mois.
  - **Approche recommandée** : **SetupIntent** pour enregistrer la carte, puis **débit off-session uniquement en cas de dommage**. Compatible avec **toutes les durées**.
  - **À vérifier au build** : durée réelle d'autorisation selon réseaux/cartes (le client souhaite confirmer si l'empreinte peut tenir plus longtemps).

### 11.2 Géolocalisation & recherche
- Géocodage des annonces (adresse → lat/lng) et des recherches.
- Requêtes « à proximité » (rayon en km) via **PostGIS** (Postgres).
- Recherche V1 : plein-texte Postgres + filtres ; option **Meilisearch/Algolia** plus tard.

### 11.3 Estimation IA de la caution
- Service d'estimation du **prix neuf** à partir du nom du matériel (recherche web / LLM).
- Prévoir un **repli** (saisie manuelle) et une validation ; liste de référence en évolution.

### 11.4 Stockage des médias
- Photos annonces et états des lieux sur stockage objet **S3-compatible** (AWS S3, Cloudflare R2 ou équivalent).

### 11.5 Emails transactionnels
- Envoi via un service transactionnel (Resend / Postmark / SendGrid) pour notifications et **litiges**.

### 11.6 Google AdSense
- Emplacements sur pages publiques ; chargement **conditionné au consentement** (voir RGPD).

---

## 12. Stratégie SEO

Levier central du projet.

### 12.1 Pages de destination
- **Une page par catégorie** de 1er niveau (pas de page par sous-catégorie / objet précis — décision validée).
  - Exemple souhaité : page **« petit outillage »**. Pas de page « perceuse ».
- **Pages catégorie × ville** : *à confirmer (section 17)*, mais **fortement recommandé** — c'est le principal générateur de trafic organique.
  - Exemple d'URL : `depotmalin.fr/location/petit-outillage/chaumont`

### 12.2 SEO technique
- **URLs propres** et lisibles (slugs).
- **`sitemap.xml`** + **`robots.txt`** générés dynamiquement.
- **Données structurées schema.org** en JSON-LD : `Product` / `Offer` (annonces), `LocalBusiness` (points relais), `BreadcrumbList`.
- **Balises meta** (title, description) et **Open Graph** par page.
- **Rendu SSG/ISR** (pré-génération) pour les pages de destination → performance + indexation.
- **Performance** (Core Web Vitals) : images optimisées, lazy-loading, cache.
- **Maillage interne** : catégories ↔ villes ↔ annonces.
- Intégration **Google Search Console**.

---

## 13. Sécurité, RGPD & obligations légales

### 13.1 RGPD / CNIL
- **Bandeau de consentement cookies** (CMP) requis, notamment pour **AdSense** et l'analytics : AdSense ne se charge qu'après acceptation.
- **Politique de confidentialité** claire (données collectées, finalités, durées, droits).
- Droits des personnes : accès, rectification, suppression, portabilité.
- Minimisation des données ; sécurisation des données personnelles et de paiement (paiement délégué à Stripe — pas de stockage de numéros de carte).

### 13.2 Mentions légales & contrats
- **Mentions légales**, **CGU**, **CGV** (obligatoires ; à faire valider juridiquement).
- Conditions spécifiques : location entre particuliers/pros, rôle d'**intermédiaire** de la plateforme, responsabilités, gestion caution & litiges, obligations des pros (facturation, TVA).

### 13.3 Sécurité applicative
- Mots de passe hachés, sessions sécurisées.
- Contrôle d'accès par rôle (membre / admin).
- Validation des uploads, protection contre les abus (rate limiting, anti-spam messagerie).
- Journalisation des actions sensibles (paiements, litiges, reversements).

---

## 14. Stack technique recommandée

Recommandation orientée **SEO + rapidité de développement + un seul écosystème** ; adaptable par Cowork.

- **Framework** : **Next.js** (App Router) + **TypeScript** — essentiel pour le SEO (SSG/ISR sur les landing pages) et pour réunir front + API.
- **UI** : **Tailwind CSS** (+ éventuellement une librairie de composants).
- **Back-end** : Route Handlers Next.js (monolithe) pour la V1 ; extraction en service dédié plus tard si besoin.
- **Base de données** : **PostgreSQL** + extension **PostGIS** (requêtes géo).
- **ORM** : **Prisma**.
- **Authentification** : **Auth.js (NextAuth)** ou solution managée.
- **Stockage médias** : **S3-compatible** (AWS S3 / Cloudflare R2).
- **Paiements** : **Stripe Connect** (comptes Express).
- **Emails** : service transactionnel (Resend / Postmark).
- **Hébergement** : Vercel (naturel pour Next.js) + Postgres managé (Neon / Supabase / Railway).
- **Mobile** : **Capacitor** pour encapsuler le web en app iOS/Android (webview) — conforme au choix V1.
- **Consentement** : CMP compatible AdSense.

> **Accélérateur possible :** **Supabase** (Postgres + PostGIS + Auth + Storage en un) peut fortement accélérer le build et se marie bien avec Next.js. À arbitrer avec Cowork.

---

## 15. Architecture applicative (vue d'ensemble)

- **Couche présentation** : pages publiques (SSG/ISR pour le SEO) + espace membre (rendu dynamique) + back-office admin.
- **Couche API / logique métier** : annonces, réservations, calendrier, caution, paiements, messagerie, avis, litiges, points relais.
- **Couche données** : PostgreSQL/PostGIS via Prisma + stockage objet pour les médias.
- **Services externes** : Stripe Connect, service IA d'estimation, email transactionnel, AdSense, Search Console.
- **App mobile** : webview (Capacitor) pointant vers le web responsive.

---

## 16. Roadmap (V1 → évolutions)

**V1 (lancement)**
- Location P2P main à main + 1 point relais (52), caution auto, Stripe Connect, messagerie, avis, litiges par email, SEO catégorie (+ catégorie × ville), AdSense.

**V1.x / V2 (évolutions déjà identifiées)**
- **Liste de référence des cautions** par équipement (repli IA).
- **Assurance** des objets (casse au-delà de la caution, vol).
- **Multi-locaux** / réseau de points relais.
- **Module de litiges** dédié (au-delà de l'email).
- **Vérification d'identité**.
- **Livraison / expédition** (au-delà du main propre).
- Facturation pro avancée (TVA, exports comptables).
- Moteur de recherche dédié (Meilisearch/Algolia) si volume élevé.

---

## 17. Points ouverts à trancher

À confirmer avant ou pendant le build (n'empêchent pas de démarrer la structure) :

1. **Paliers de prix** : valider les 4 paliers (demi-journée / journée / semaine / mois) et la règle de tarification (combinaison la plus avantageuse ?).
2. **Pages SEO catégorie × ville** : valider la génération de pages par ville (recommandé).
3. **Liste des catégories** de 1er niveau (proposition ci-dessous à valider).
4. **Estimation IA de la caution en V1** : incluse dès la V1, ou saisie/validation manuelle au démarrage ?
5. **Frais point relais** : qui les paie (locataire, propriétaire, partagés) et montant/format (fixe, %).
6. **Cadence de reversement** : hebdomadaire ou mensuelle.
7. **Gestion de la caution longue durée** : confirmer l'approche (SetupIntent + débit si dommage) et vérifier la durée d'autorisation Stripe.
8. **Détail des obligations pro** (facturation, TVA, statut).

### Proposition de catégories (à valider)
Outillage & bricolage · Jardinage & extérieur · Électroménager · Informatique & high-tech · Image & son · Sport & loisirs · Camping & plein air · Bébé & enfant · Événementiel & réception · Mobilier & déco · Auto / moto / vélo · Instruments de musique.

---

*Fin du document — Base de connaissance Dépôt Malin v1.0.*
