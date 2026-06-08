# PlantAddict

Application web dédiée au suivi de plantes d'intérieur — **projet isolé** dans le dépôt (`plantaddict/`), sans impact sur les autres fichiers à la racine.

## Fonctionnalités

- Authentification obligatoire (Firebase Auth)
- Bibliothèque de 30 plantes d'intérieur
- Mon jardin + wishlist
- Calculateur de dose d'engrais (pot × dilution × facteur substrat)
- Substrats : liste fixe + mix personnalisé
- Engrais : catalogue + saisie libre
- Rappels engrais + notifications push
- Bilingue FR / EN

## Démarrage rapide

### Avec Firebase (recommandé)

```bash
cd plantaddict
npm install
npx -y firebase-tools@latest login
npm run setup:firebase
npm run dev
```

Guide détaillé : [SETUP_FIREBASE.md](./SETUP_FIREBASE.md)

### Sans Firebase (mode démo)

Si `.env` est absent, l'app fonctionne en mode démo (stockage local navigateur).

```bash
cd plantaddict
npm install
npm run dev
```

## Déploiement

```bash
npm run deploy
```

**En ligne :** https://plantaddict-apps.web.app

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS 4
- Firebase Auth + Firestore + Hosting + FCM
- react-i18next (FR/EN)
