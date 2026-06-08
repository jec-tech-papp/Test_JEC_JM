# PlantAddict

Application web pour suivre vos plantes d'intérieur : bibliothèque, jardin personnel, wishlist, calcul de doses d'engrais et rappels push.

## Fonctionnalités MVP

- **Authentification obligatoire** (email/mot de passe via Firebase, ou mode démo local)
- **Bibliothèque** : 30 plantes d'intérieur avec fiches détaillées (lumière, arrosage, humidité, engrais…)
- **Mon jardin** : portefeuille personnel avec pot (L), substrat, engrais, emplacement
- **Wishlist** : plantes à acquérir
- **Calculateur de dose** : `dose (ml) = volume pot (L) × dilution engrais (ml/L) × facteur substrat`
- **Substrats** : liste fixe + mix personnalisé en %
- **Engrais** : catalogue (Biobizz, Plagron…) + saisie libre
- **Rappels engrais** avec notifications navigateur
- **Bilingue** FR / EN

## Démarrage rapide (mode démo)

Sans configuration Firebase, l'app fonctionne en mode démo avec stockage local :

```bash
cd plant-tracker
npm install
npm run dev
```

Créez un compte sur `/register` — les données sont stockées dans le navigateur.

## Configuration Firebase (production)

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Authentication** (Email/Password)
3. Créez une base **Firestore**
4. Créez une app Web et copiez la config dans `.env` :

```bash
cp .env.example .env
# Remplissez les variables VITE_FIREBASE_*
```

5. Déployez les règles Firestore :

```bash
npx firebase-tools deploy --only firestore:rules
```

6. Pour les push notifications, générez une paire VAPID dans Firebase > Cloud Messaging

## Build & déploiement

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Firebase Auth + Firestore + FCM
- react-i18next (FR/EN)
