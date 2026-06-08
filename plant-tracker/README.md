# PlantKeeper - Suivi de plantes d'intérieur

Application web pour les passionnés de plantes d'intérieur. Gérez votre collection, suivez vos apports en engrais avec des doses précises calculées selon le volume du pot et le substrat utilisé.

## Fonctionnalités

### Bibliothèque de plantes
- Plus de 30 plantes documentées avec informations détaillées
- Conditions de lumière, arrosage, température
- Besoins en engrais (type, NPK, fréquence, dosage)
- Substrat recommandé et besoins en drainage
- Filtres par catégorie, difficulté, recherche textuelle

### Portfolio personnel
- Ajoutez des plantes à votre collection
- Renseignez le volume du pot, le type de pot, l'emplacement
- Associez un substrat personnalisé
- Calcul automatique de la dose d'engrais exacte

### Wishlist
- Liste de souhaits avec priorités
- Ajout rapide depuis la bibliothèque

### Gestion des substrats
- Créez des mélanges personnalisés
- 15 composants disponibles (perlite, écorce, sphaigne, pomice, etc.)
- Calcul automatique des propriétés (rétention, drainage, nutriments)
- Influence directe sur le calcul des doses d'engrais

### Suivi des engrais
- Plannings de fertilisation par plante
- Calcul de dose exact basé sur:
  - Volume du pot (litres)
  - Concentration recommandée (ml/L)
  - Score nutriments du substrat (ajuste la dose)
- Historique des apports
- Notifications pour les apports en retard

## Stack technique

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de données**: SQLite via Prisma ORM + libSQL adapter
- **Auth**: Sessions cookie custom avec bcrypt
- **UI**: Lucide React (icônes), date-fns

## Installation

```bash
cd plant-tracker
npm install
npx prisma db push
npm run db:seed
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Structure du projet

```
plant-tracker/
├── prisma/
│   ├── schema.prisma    # Schéma de la base de données
│   └── seed.ts          # Données initiales (plantes, composants)
├── src/
│   ├── app/
│   │   ├── (auth)/      # Pages login/register
│   │   ├── (app)/       # Pages authentifiées
│   │   │   ├── library/     # Bibliothèque de plantes
│   │   │   ├── portfolio/   # Collection personnelle
│   │   │   ├── wishlist/    # Liste de souhaits
│   │   │   ├── substrates/  # Gestion des substrats
│   │   │   └── schedules/   # Plannings & notifications
│   │   └── api/         # API Routes
│   ├── components/      # Composants React
│   └── lib/             # Utilitaires, prisma, auth
└── package.json
```

## Calcul de dosage

La dose d'engrais est calculée ainsi:
1. Volume d'eau = Volume pot × 0.3 (30% pour un arrosage complet)
2. Dose brute = Concentration (ml/L) × Volume d'eau (L)
3. Dose ajustée = Dose brute ÷ Score nutriments du substrat

Un substrat riche en nutriments (score > 1) réduit la dose nécessaire.
Un substrat minéral (score < 1) augmente la dose.
