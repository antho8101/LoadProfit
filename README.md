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

LoadProfit V1 donne une **estimation simple** : profit, marge, prix minimum, impact du retour à vide — et conserve un **historique local** pour retrouver les analyses passées.

## Stack technique

| Élément | Choix |
|--------|--------|
| Framework | **Next.js** (App Router), **React 19** |
| Langage | **TypeScript** |
| Styles | **Tailwind CSS v4** |
| Persistance | **localStorage** (navigateur), sans serveur ni base V1 |
| Auth | Aucune en V1 |

Les composants dans `src/components/ui/` reprennent une **structure proche de shadcn/ui** (cartes, boutons, champs), sans dépendance au CLI shadcn, pour garder le projet **léger et lisible**.

## Lancer le projet en local

**Prérequis :** [Node.js](https://nodejs.org/) 20+ recommandé, **npm** (fourni avec Node).

```bash
cd LoadProfit
npm install
npm run dev
```

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
    │   ├── api/fuel/france-average/route.ts  # Prix moyens FR (serveur + cache)
    │   ├── globals.css      # Thème minimal + Tailwind
    │   ├── layout.tsx       # Layout racine et métadonnées
    │   └── page.tsx         # Page d’accueil (shell)
    ├── components/
    │   ├── ui/              # Primitifs UI réutilisables
    │   ├── trip-app.tsx     # Orchestration client (état + sections)
    │   ├── trip-calculator-form.tsx
    │   ├── trip-results.tsx
    │   ├── trip-history.tsx
    │   ├── dashboard-summary.tsx
    │   ├── vehicle-form.tsx
    │   ├── vehicle-list.tsx
    │   └── vehicle-settings-panel.tsx
    ├── lib/
    │   ├── fuel/france-average.ts  # Agrégation jeu de données officiel + fallback
    │   ├── calc/trip.ts     # Moteur de calcul course
    │   ├── calc/vehicle.ts  # Coût / km à partir d’un profil véhicule
    │   ├── storage/trip-history.ts  # Historique (localStorage)
    │   ├── storage/vehicles.ts      # Profils véhicules (localStorage)
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

1. **Distance à l’aller** = valeur saisie (km), **manuelle** en V1.
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
- **Usage produit** : dans le profil véhicule, choix **France average (official data)** ou **Manual** ; en mode France, le prix de base est prérempli selon le type diesel/essence ; l’utilisateur peut toujours le modifier. Les **professionnels** peuvent devoir corriger (cartes, remises, effets fiscaux) — l’outil fournit une **référence indicative**, pas un prix contractuel.

**CRUD minimal :** création, liste, suppression d’un profil (pas d’édition dans cette itération, pour limiter la complexité).

## Tests manuels recommandés (V1.3)

1. Ouvrir **Vehicle setup** → créer un véhicule avec **France average** → vérifier le préremplissage du prix et le **total € / km**.  
2. Couper le réseau ou simuler une erreur → message de repli non bloquant, valeurs fallback, formulaire toujours submittable.  
3. **Manual** : saisir un prix et une **adjustment** négative telle que base + ajustement ≥ 0 → enregistrer et vérifier le coût au km.  
4. Calculatrice : sélectionner le véhicule → coût au km cohérent ; **Save this trip** → historique OK.  
5. `GET /api/fuel/france-average` (navigateur ou curl) → JSON avec `source` et `updatedAt`.  
6. Recharger la page → historique et véhicules toujours en **localStorage**.  

## Feuille de route V2 (idées)

Pistes réalistes pour la suite du produit — **hors périmètre V1** :

| Idée | Description |
|------|-------------|
| **Distance automatique** | Saisie ville → km via API cartographique ou table interne. |
| **Préréglages carburant** | Barèmes par zone ou par période. |
| **Comptes utilisateurs** | Connexion, sauvegarde multi-appareils. |
| **Synchronisation cloud** | Historique et paramètres partagés. |
| **Export PDF** | Fiche « offre vs coût » à envoyer ou archiver. |
| **Barème carburant auto** | Valeur par défaut depuis données hebdomadaires officielles par pays. |
| **Mode petite équipe** | Partage de règles ou d’historique entre collègues. |

## Limites connues (V1 à V1.3)

- Pas de **géocodage** : la distance est **saisie à la main**.
- **Pas de sauvegarde serveur** : changer de navigateur ou vider les données efface l’historique et les profils.
- **Moyennes France** : agrégation simple sur le flux instantané (pas de station la plus proche, pas de filtre par route). Indication **non contractuelle**.
- **Pas d’édition** des profils véhicule dans cette version (supprimer et recréer si besoin).

---

Projet pensé pour être **facile à faire tourner**, **facile à lire** pour quelqu’un qui n’est pas développeur au quotidien, et **prêt à évoluer** (auth, API, base de données) sans réécrire toute la logique métier.
#   L o a d P r o f i t  
 