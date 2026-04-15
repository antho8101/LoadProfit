# Arborescence LoadProfit

Vue du dépôt **sans** `node_modules/` ni `.next/` (dossiers générés localement après `npm install` / `npm run build`).

## Arbre (structure)

```
LoadProfit/
├── .gitignore
├── ARBORESCENCE.md
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── dashboard-summary.tsx
    │   ├── trip-app.tsx
    │   ├── trip-calculator-form.tsx
    │   ├── trip-history.tsx
    │   ├── trip-results.tsx
    │   └── ui/
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       └── label.tsx
    ├── lib/
    │   ├── calc/
    │   │   └── trip.ts
    │   ├── storage/
    │   │   └── trip-history.ts
    │   ├── dashboard.ts
    │   ├── format.ts
    │   └── utils.ts
    └── types/
        └── trip.ts
```

## Liste des fichiers et rôle

### Racine

| Fichier | Description |
|---------|-------------|
| `.gitignore` | Fichiers et dossiers ignorés par Git |
| `ARBORESCENCE.md` | Ce document (arborescence + inventaire) |
| `README.md` | Documentation projet, lancement, logique métier |
| `eslint.config.mjs` | Configuration ESLint (Next.js) |
| `next-env.d.ts` | Types TypeScript générés / fournis par Next.js |
| `next.config.ts` | Configuration Next.js |
| `package.json` | Dépendances et scripts npm |
| `package-lock.json` | Verrouillage des versions (généré par npm) |
| `postcss.config.mjs` | PostCSS (Tailwind) |
| `tsconfig.json` | Configuration TypeScript |

### `src/app/`

| Fichier | Description |
|---------|-------------|
| `globals.css` | Styles globaux + import Tailwind |
| `layout.tsx` | Layout racine, polices, métadonnées |
| `page.tsx` | Page d’accueil (point d’entrée UI) |

### `src/components/`

| Fichier | Description |
|---------|-------------|
| `trip-app.tsx` | Orchestration client : état, historique, sections |
| `trip-calculator-form.tsx` | Formulaire + calcul + enregistrement |
| `trip-results.tsx` | Carte des résultats et badge de rentabilité |
| `trip-history.tsx` | Tableau d’historique + vidage |
| `dashboard-summary.tsx` | Cartes du tableau de bord (agrégats) |

### `src/components/ui/`

| Fichier | Description |
|---------|-------------|
| `card.tsx` | Primitifs carte (Card, Header, Title, etc.) |
| `button.tsx` | Bouton stylé |
| `input.tsx` | Champ de saisie |
| `label.tsx` | Libellé de formulaire |
| `badge.tsx` | Badge de statut (rentable / marge faible / perte) |

### `src/lib/`

| Fichier | Description |
|---------|-------------|
| `calc/trip.ts` | Moteur de calcul métier (profit, marge, statut) |
| `storage/trip-history.ts` | Lecture / écriture `localStorage` |
| `dashboard.ts` | Statistiques agrégées sur l’historique |
| `format.ts` | Formatage montants, km, pourcentages (fr-FR) |
| `utils.ts` | Utilitaire `cn()` pour classes CSS |

### `src/types/`

| Fichier | Description |
|---------|-------------|
| `trip.ts` | Types TypeScript partagés (entrées, résultats, historique) |

## Dossiers présents uniquement en local

Ces dossiers ne sont **pas** listés dans l’arbre « sources » ci-dessus car ils sont créés après installation ou build :

| Dossier | Origine |
|---------|---------|
| `node_modules/` | `npm install` |
| `.next/` | `npm run dev` ou `npm run build` |
