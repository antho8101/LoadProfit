# LoadProfit

**LoadProfit** est une application web (SaaS orienté MVP) qui aide les **petites entreprises de transport** et les **routiers indépendants** à décider rapidement si une course est **rentable** avant de l’accepter.

Ce n’est pas un outil de gestion de flotte, ni une place de marché, ni un ERP logistique : uniquement une **aide à la décision** centrée sur le **profit** d’un trajet.

## Pour qui ?

- Transporteurs avec peu de marge de manœuvre sur les tarifs négociés.
- Chauffeurs qui veulent un **chiffre rapide** (coût vs prix) sans tableur.
- Équipes qui testent une idée produit **sans base de données** ni compte utilisateur au départ.

## Problème résolu

Avant d’accepter une course, il faut souvent comparer :

- le **prix proposé** ;
- les **coûts** (carburant, péage, usure, temps…) ;
- parfois un **retour à vide** qui double la distance « payée » par le client.

LoadProfit donne une **estimation simple** : profit, marge, prix minimum, impact du retour à vide — avec **historique et véhicules synchronisés au compte** (Firestore) lorsque l’utilisateur est connecté.

## Stack technique

| Élément | Choix |
|--------|--------|
| Framework | **Next.js** (App Router), **React 19** |
| Langage | **TypeScript** |
| Styles | **Tailwind CSS v4** |
| Persistance | **Firestore** (données métier par compte) + **localStorage** (préférences UI légères) |
| Auth | **Firebase Authentication** (email/mot de passe + Google) |
| Paiement | **Stripe Checkout** (abonnement) + **webhooks** (source de vérité facturation) |

Les composants dans `src/components/ui/` reprennent une **structure proche de shadcn/ui** (cartes, boutons, champs), sans dépendance au CLI shadcn, pour garder le projet **léger et lisible**.

### Comptes, données et abonnement

- **Accueil `/`** : réservé aux utilisateurs connectés ; sinon redirection vers **`/auth`**.
- **Véhicules** et **courses enregistrées** : sous-collections Firestore `users/{uid}/vehicles` et `users/{uid}/trips`.
- **Profil utilisateur** : document `users/{uid}` (email, nom, dates, `stripeCustomerId`, état d’abonnement).
- **Facturation** : l’état payant affiché dans l’app provient des **webhooks Stripe** (mise à jour du document utilisateur). Ne pas se fier uniquement au client.
- **Géolocalisation** : toujours en **localStorage** (hors compte).

### Variables Firebase (client — `NEXT_PUBLIC_*`)

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé Web |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ex. `projet.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID projet |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Souvent `projet.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID expéditeur |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID app |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optionnel — Google Analytics (ex. `G-…`) |

**Console :** Authentication → activer **Email/Password** et **Google** ; Firestore → créer la base ; déployer les règles du fichier **`firestore.rules`**.

**Serveur :** `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON du compte de service **sur une seule ligne** (pour Stripe webhook + vérification des jetons). Ne pas commiter.

### Variables Stripe

| Variable | Rôle |
|----------|------|
| `STRIPE_SECRET_KEY` | Clé secrète |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique (réserve extensions futures) |
| `STRIPE_WEBHOOK_SECRET` | Secret du endpoint webhook |
| `STRIPE_PRICE_ID_MONTHLY` | ID du prix d’abonnement récurrent |
| `NEXT_PUBLIC_APP_URL` | Base URL (success/cancel Checkout), ex. `http://localhost:3000` |

**Webhook :** créer un endpoint dans Stripe pointant vers `https://<domaine>/api/stripe/webhook` ; souscrire à `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### Flux auth

1. `/auth` — inscription ou connexion (email/mot de passe ou Google).
2. `AuthProvider` — `onAuthStateChanged` + `ensureUserDocument` (création du doc utilisateur si besoin).
3. Jeton Firebase pour **`POST /api/stripe/create-checkout-session`** (`Authorization: Bearer <idToken>`).

### Flux Stripe (résumé)

1. Utilisateur authentifié → **Upgrade** → API vérifie le jeton → client Stripe + session Checkout.
2. Paiement sur Stripe → webhooks → mise à jour **`users/{uid}`** (`subscriptionStatus`, période, plan).

### Tests manuels (compte + billing)

1. Créer un compte email/mot de passe  
2. Se connecter email/mot de passe  
3. Se connecter avec Google  
4. Se déconnecter  
5. Recharger la page — session Firebase persistée  
6. Ajouter un véhicule — présent après rechargement  
7. Enregistrer une course (accepté/refusé) — présente après rechargement  
8. Lancer un Checkout test (cartes [Stripe test](https://stripe.com/docs/testing))  
9. Vérifier que le webhook met à jour le statut dans le panneau Compte  
10. Vérifier `users/{uid}` dans la console Firestore après événements  

## Lancer le projet en local

**Prérequis :** [Node.js](https://nodejs.org/) 20+ recommandé, **npm** (fourni avec Node).

```bash
cd LoadProfit
npm install
npm run dev
```

À la racine, le fichier **`.env`** regroupe **Firebase** (variables `NEXT_PUBLIC_FIREBASE_*`), **`FIREBASE_SERVICE_ACCOUNT_JSON`**, **Google Maps** (distance / Places), **Stripe**, et **`NEXT_PUBLIC_APP_URL`**. Sans configuration Firebase complète, l’auth et la synchro ne fonctionneront pas ; sans clé Maps, la distance peut être saisie à la main. Le fichier `.env` est ignoré par Git.

Ouvrez [http://localhost:3000](http://localhost:3000). La page se met à jour à chaud pendant le développement.

**Autres commandes utiles :**

```bash
npm run build   # build de production
npm run start   # serveur après build
npm run lint    # vérification ESLint
```

## Structure du dépôt

```
LoadProfit/
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── src/
    ├── app/
    │   ├── api/fuel/france-average/route.ts      # Prix moyens nationaux FR (serveur + cache)
    │   ├── api/fuel/local-benchmark/route.ts     # Benchmark local depuis coords (serveur + cache)
    │   ├── api/route-distance/route.ts           # Distance d’itinéraire (Google, serveur uniquement)
    │   ├── auth/page.tsx    # Connexion / inscription
    │   ├── globals.css      # Thème minimal + Tailwind
    │   ├── layout.tsx       # Layout racine + AuthProvider
    │   └── page.tsx         # Accueil (AppShell)
    ├── components/
    │   ├── ui/              # Primitifs UI réutilisables
    │   ├── app-shell.tsx    # App connectée (Firestore + sections)
    │   ├── auth-form.tsx
    │   ├── account-panel.tsx
    │   ├── trip-calculator-form.tsx
    │   ├── trip-results.tsx
    │   ├── trip-history.tsx
    │   ├── dashboard-summary.tsx
    │   ├── vehicle-form.tsx
    │   ├── vehicle-list.tsx
    │   ├── vehicle-settings-panel.tsx
    │   └── location-prompt.tsx   # Premier prompt Allow / Skip (géoloc)
    ├── lib/
    │   ├── fuel/france-average.ts  # Agrégation jeu de données officiel + fallback
    │   ├── fuel/local-benchmark.ts # Moyenne « proche » (stations dans un rayon) + repli national
    │   ├── google/geocoding.ts       # Geocoding API (serveur)
    │   ├── google/routes.ts          # Routes API computeRoutes (serveur)
    │   ├── location/client.ts      # getCurrentPosition une fois (pas de watch)
    │   ├── storage/location-preferences.ts  # Consentement + dernières coords (localStorage)
    │   ├── calc/trip.ts     # Moteur de calcul course
    │   ├── calc/vehicle.ts  # Coût / km à partir d’un profil véhicule
    │   ├── firebase/        # Client Auth/Firestore + admin (serveur)
    │   ├── storage/trip-history.ts  # Fallback local (hors flux principal cloud)
    │   ├── storage/vehicles.ts      # Helpers enrichissement (toujours utilisés côté client)
    │   ├── dashboard.ts     # Agrégats pour le tableau de bord
    │   ├── format.ts        # Montants, km, pourcentages (locale en-US, EUR)
    │   └── utils.ts       # Utilitaire `cn()` (classes CSS)
    └── types/
        ├── trip.ts          # Types course / historique
        └── vehicle.ts       # Types profil véhicule
```

**Séparation UI / logique :** les formules et statuts sont dans `lib/calc/trip.ts` ; la **validation des champs** (nombres finis, bornes) vit dans le formulaire. Le calculateur suppose des entrées déjà valides.

## Logique métier (V1 / V1.1)

Les règles suivantes sont implémentées dans `src/lib/calc/trip.ts` :

1. **Distance à l’aller** = en **V1.5** calculée automatiquement (itinéraire routier via Google) ; **saisie manuelle** possible en secours ou préférence.
2. **Distance opérationnelle**  
   - sans retour à vide : égale à la distance aller ;  
   - avec **retour à vide** : `distance aller × 2`.
3. **Coût total estimé** = `distance opérationnelle × coût au km`.
4. **Chiffre d’affaires (affiché)** = **prix offert** (ce que le client paie pour la course).
5. **Profit** = `prix offert − coût total`.
6. **Prix minimum rentable** = `coût total` (seuil de rentabilité à 0 € de profit).
7. **Marge %** = `(profit / prix offert) × 100` — **non calculée** si le prix offert est invalide (évite division par zéro / NaN).
8. **Statut** :  
   - **Perte** : profit ≤ 0 ;  
   - **Rentable** : profit > 0 **et** marge ≥ 15 % ;  
   - **Marge faible** : profit > 0 **et** marge &lt; 15 %.

**Impact retour à vide :** kilomètres et coût **supplémentaires** par rapport au seul aller (0 si l’option est désactivée).

**Flux V1.1 :** le bouton principal **ne fait que calculer** ; l’enregistrement dans l’historique se fait via **Save this trip** après coup. Si vous modifiez une saisie, le résultat affiché est réinitialisé jusqu’à un nouveau calcul.

**Historique :** les lignes sauvegardées incluent id, date, route, prix offert, coût total, profit, statut, **distance aller**, **retour à vide**, **marge %**, **nom du véhicule** (si un profil était sélectionné). Stockage **local** (`localStorage`, clé `loadprofit-trips-v1`), **limité aux 100 entrées les plus récentes** pour éviter une croissance infinie.

## Profils véhicule (V1.2)

Les profils sont **optionnels** : le calculateur fonctionne toujours avec un **coût au km saisi à la main**. Si vous enregistrez un véhicule, vous pouvez le **sélectionner** pour préremplir le coût au km (modifiable ensuite).

**Stockage :** liste JSON dans `localStorage`, clé séparée `loadprofit-vehicles-v1` (indépendante de l’historique de courses).

**Formules** (implémentées dans `src/lib/calc/vehicle.ts`) :

- **Coût carburant au km** = `(consommation moyenne en L / 100 km) / 100 × prix du carburant au litre`  
- **Total des coûts fixes mensuels** = assurance + entretien + pneus + autres fixes  
- **Coût fixe au km** = total des coûts fixes mensuels ÷ **kilomètres mensuels estimés** (obligatoire, &gt; 0)  
- **Coût total au km** = coût carburant au km + coût fixe au km  

**Prix carburant effectif (V1.3)** : `prix de base (€/L) + ajustement (€/L)`. L’ajustement sert par exemple aux remises carte carburant ou négociations ; il peut être négatif si le prix de base le permet, tant que la somme reste ≥ 0.

## Prix moyen carburant France (V1.3)

- **Source** : jeu ouvert *prix-des-carburants-en-france-flux-instantane-v2* (data.economie.gouv.fr), consommé **côté serveur uniquement** — le navigateur appelle la route interne **`GET /api/fuel/france-average`**, pas l’URL du ministère directement.  
- **Cache serveur** : résultat mis en cache en mémoire **15 minutes** pour limiter la charge.  
- **Réponse JSON** : `{ diesel, petrol, source: "official_france_dataset" | "fallback", updatedAt }`.  
- **Diesel** : moyenne nationale des `gazole_prix` valides (&gt; 0) sur l’échantillon chargé.  
- **Essence (indice « petrol »)** : pour chaque station, moyenne des grades **SP95, E10, SP98** parmi celles qui sont renseignées (chaque grade &gt; 0), puis moyenne nationale de ces moyennes par station. **E85 exclu** (produit différent).  
- **Robustesse** : si l’API externe échoue, le parsing est vide, ou trop peu de points valides (&lt; 30 par carburant), le serveur renvoie des **valeurs de repli** documentées dans le code (`source: "fallback"`). Le formulaire véhicule reste utilisable.  
- **Usage produit** : dans le profil véhicule, choix **Manual**, **France average** ou **Near my location** (V1.4, si la géoloc a été autorisée et qu’une position est disponible — sinon repli France) ; le prix de base est prérempli selon le mode ; l’utilisateur peut toujours le modifier. Les **professionnels** peuvent devoir corriger (cartes, remises, effets fiscaux) — l’outil fournit une **référence indicative**, pas un prix contractuel.

**CRUD minimal :** création, liste, suppression d’un profil (pas d’édition dans cette itération, pour limiter la complexité).

## Géolocalisation et benchmark local (V1.4)

L’app peut demander **l’accès à la position** du navigateur **une seule fois** (pas de suivi continu, pas de `watchPosition`, pas de carte) afin d’améliorer la **pertinence du prix carburant de référence** pour la zone.

- **Premier lancement** : un bandeau simple propose **Autoriser** ou **Ignorer** (« Allow location access to estimate local fuel prices automatically »). Une fois répondu, le choix est mémorisé dans **`localStorage`** (clé `loadprofit-location-v1`) : consentement, indicateur « prompt déjà vu », dernières coordonnées et horodatage si la position a été obtenue.
- **Source carburant** (`FuelPriceSource`) : **`manual`** (saisie), **`france_average`** (moyenne nationale officielle), **`near_my_location`** (estimation à partir des stations du jeu de données dans un rayon autour du dernier point connu).
- **API** : `GET /api/fuel/local-benchmark?lat=…&lng=…` — agrège les prix des stations proches (logique côté serveur, cache mémoire ~15 min). En cas d’échec ou de trop peu de points, **repli** sur la moyenne nationale comme pour `/api/fuel/france-average`, puis valeurs de secours si besoin.
- **Sans géoloc** (refus, erreur, timeout, navigateur sans API) : l’app reste utilisable ; le mode « près de moi » se comporte comme la **moyenne France** avec un message discret si utile. Aucun spam de demandes de permission.
- **Contrôle utilisateur** : le prix au litre reste **éditable** ; l’ajustement €/L est conservé. La source affichée reste discrète (« Source: near your location », etc.).

## Distance d’itinéraire (V1.5 — Google)

Par défaut, la **distance aller** n’est plus saisie à la main : l’application appelle une route interne **`POST /api/route-distance`** avec `origin` et `destination` (texte libre). Le serveur :

1. géocode les deux extrémités (**Geocoding API**) ;
2. calcule un itinéraire **voiture** avec **Routes API** (`computeRoutes`, `TRAFFIC_UNAWARE`, sans polyline ni itinéraires alternatifs) ;
3. renvoie `distanceKm`, `durationMinutes` (si disponible), `source: "google_routes"`.

**Variables dans `.env` :** la clé n’est **jamais** exposée au navigateur — uniquement le serveur Next.js l’utilise.

| Variable | Rôle |
|----------|------|
| `GOOGLE_MAPS_API_KEY` | Une seule clé pour **Geocoding** et **Routes** (cas le plus courant). |
| `GOOGLE_MAPS_GEOCODING_API_KEY` | Optionnel : clé dédiée au géocodage (sinon → `GOOGLE_MAPS_API_KEY`). |
| `GOOGLE_MAPS_ROUTES_API_KEY` | Optionnel : clé dédiée aux itinéraires (sinon → `GOOGLE_MAPS_API_KEY`). |

**Obtenir une clé (Google Cloud Console), étape par étape :**

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/) et connectez-vous avec un compte Google.  
2. **Projet** : en haut, sélectionnez un projet existant ou **Nouveau projet**, donnez-lui un nom, puis validez.  
3. **Facturation** : Menu ☰ → **Facturation** — liez un compte de facturation au projet (les APIs Maps ont un quota gratuit mais la facturation doit être activée sur le projet).  
4. **Activer les APIs** : Menu ☰ → **APIs et services** → **Bibliothèque**. Dans la recherche, tapez **Geocoding API** → Ouvrir → **Activer**. Recherchez **Routes API** → **Activer**. (Ne confondez pas avec « Maps JavaScript API » seule.)  
5. **Créer une clé** : Menu ☰ → **APIs et services** → **Identifiants** → **Créer des identifiants** → **Clé API**. Une longue chaîne s’affiche : copiez-la.  
6. **Restrictions (recommandé)** : dans **Identifiants**, cliquez sur la clé → **Restrictions d’API** → limitez aux APIs **Geocoding** et **Routes** ; pour la prod, ajoutez aussi des restrictions réseau selon la doc Google.  
7. Collez la clé dans **`.env`** sur une ligne `GOOGLE_MAPS_API_KEY=votre_cle_sans_espaces`, enregistrez le fichier, puis **redémarrez** `npm run dev`.

En général **une seule clé** suffit : les deux APIs sont activées sur le même projet et la même clé les appelle.

**Repli :** si la clé est absente, le géocodage ou l’itinéraire échoue, ou la réponse est invalide, l’API renvoie une erreur lisible avec `manualFallbackAllowed: true`. L’interface affiche un message calme et propose la **saisie manuelle** de la distance (ouverte automatiquement en cas d’échec).

**Cache léger :** la dernière paire origine/destination réussie est mémorisée dans **`sessionStorage`** (`loadprofit-route-distance-v1`) pour éviter un nouvel appel si vous recalculez la même route dans la session.

## Tests manuels recommandés (V1.3)

1. Ouvrir **Vehicle setup** → créer un véhicule avec **France average** → vérifier le préremplissage du prix et le **total € / km**.  
2. Couper le réseau ou simuler une erreur → message de repli non bloquant, valeurs fallback, formulaire toujours submittable.  
3. **Manual** : saisir un prix et une **adjustment** négative telle que base + ajustement ≥ 0 → enregistrer et vérifier le coût au km.  
4. Calculatrice : sélectionner le véhicule → coût au km cohérent ; **Save this trip** → historique OK.  
5. `GET /api/fuel/france-average` (navigateur ou curl) → JSON avec `source` et `updatedAt`.  
6. Recharger la page → historique et véhicules toujours en **localStorage**.  

## Tests manuels recommandés (V1.4 — géoloc et carburant local)

1. **Premier lancement, autorisation** : accepter la géoloc → pas de répétition intempestive du bandeau après rechargement ; création d’un véhicule avec source **near my location** → préremplissage cohérent et mention de source.
2. **Premier lancement, refus** : ignorer → l’app fonctionne ; benchmark **France** ou saisie manuelle ; pas de blocage.
3. **Véhicule avec `near_my_location`** : avec coords stockées, vérifier l’appel implicite au benchmark local ; sans coords (ex. effacement manuel du stockage partiel), repli France ou message non bloquant.
4. **Repli France** : couper le réseau ou forcer une erreur API locale → valeurs nationales ou fallback, formulaire toujours valide.
5. **Surcharge manuelle** : après auto-remplissage, modifier le prix au litre → le profil conserve la saisie.
6. **Rechargement** après consentement antérieur → pas de nouveau prompt ; réutilisation des préférences et des coords si présentes.
7. **Navigateur sans géoloc** (ou API indisponible) : pas de crash ; comportement dégradé gracieux (France / manuel).

## Tests manuels recommandés (V1.5 — distance Google)

1. **Itinéraire valide** : deux villes réalistes → distance et durée affichées, profit calculé.  
2. **Avec véhicule** : sélection d’un profil → coût/km + distance auto → résultat cohérent.  
3. **Surcharge manuelle** : lien « Edit distance manually » → saisie km → calcul sans appel route (ou en complément).  
4. **Échec géocodage** : libellés absurdes ou introuvables → message + saisie manuelle possible.  
5. **Échec route / clé manquante** : sans clé configurée dans `.env` ou erreur API → message + bascule saisie manuelle.  
6. **Validation** : champs vides ou prix ≤ 0 → erreurs de formulaire, pas de crash.  
7. **Répétition** : même origine/destination deux fois → cache session éventuel, comportement stable.

## Feuille de route V2 (idées)

Pistes réalistes pour la suite du produit — **hors périmètre V1** :

| Idée | Description |
|------|-------------|
| **Affinage distance** | Tolérances péage, horaires, plusieurs segments. |
| **Préréglages carburant** | Barèmes par zone ou par période. |
| **Comptes utilisateurs** | Connexion, sauvegarde multi-appareils. |
| **Synchronisation cloud** | Historique et paramètres partagés. |
| **Export PDF** | Fiche « offre vs coût » à envoyer ou archiver. |
| **Barème carburant auto** | Valeur par défaut depuis données hebdomadaires officielles par pays. |
| **Mode petite équipe** | Partage de règles ou d’historique entre collègues. |

## Limites connues (V1 à V1.5)

- **Distance** : l’estimation d’itinéraire repose sur **Google Routes** (trafic non pris en compte par défaut, `TRAFFIC_UNAWARE`). Ce n’est pas une distance « péage comprise » contractuelle ; l’utilisateur peut corriger au km près en manuel.
- **Compte requis** : l’historique et les véhicules sont liés au compte Firebase ; vider le cache navigateur seul ne supprime pas les données cloud (tant que vous restez connecté).
- **Moyennes et benchmark local** : agrégation sur le flux instantané officiel ; le mode « près de moi » utilise une **approximation géographique** (stations dans un rayon), pas une recherche de station sur l’itinéraire. Indication **non contractuelle**.
- **Pas d’édition** des profils véhicule dans cette version (supprimer et recréer si besoin).

---

Projet pensé pour être **facile à faire tourner**, **facile à lire** pour quelqu’un qui n’est pas développeur au quotidien, et **prêt à évoluer** (auth, API, base de données) sans réécrire toute la logique métier.

**Build :** si `next build` échoue avec une erreur de type « Cannot find module for page » sur une route API alors que le fichier existe, supprimer le dossier **`.next`** puis relancer `npm run build` (cache de build obsolète).