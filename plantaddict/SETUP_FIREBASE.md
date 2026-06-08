# Configuration Firebase — PlantAddict (projet isolé)

PlantAddict utilise son **propre projet Firebase**, séparé des autres apps du dépôt.

## Prérequis

- Compte Google
- Node.js 20+

## 1. Connexion Firebase CLI

```bash
cd plantaddict
npx -y firebase-tools@latest login
```

En environnement sans navigateur :

```bash
npx -y firebase-tools@latest login --no-localhost
```

## 2. Bootstrap automatique

```bash
npm run setup:firebase
```

Par défaut, le projet Firebase `plantaddict-app` sera créé. Pour un ID personnalisé :

```bash
./scripts/setup-firebase.sh mon-plantaddict-unique
```

Le script :
- crée le projet Firebase (s'il n'existe pas)
- active Firestore (région `europe-west1`)
- crée l'app Web
- génère le fichier `.env`
- déploie les règles Firestore

## 3. Étapes manuelles dans la Console

Ouvrez : `https://console.firebase.google.com/project/<PROJECT_ID>`

### Authentication
1. **Authentication** → **Sign-in method**
2. Activez **Email/Password**

### Push notifications (optionnel)
1. **Project Settings** → **Cloud Messaging**
2. **Web Push certificates** → générez une paire VAPID
3. Copiez la clé dans `.env` :

```
VITE_FIREBASE_VAPID_KEY=votre-cle-vapid
```

## 4. Lancer l'app

```bash
npm install
npm run dev
```

L'app utilise Firebase (plus de mode démo) dès que `.env` est rempli.

## 5. Déployer en production

```bash
npm run deploy
```

Cela build l'app et déploie sur **Firebase Hosting**.

URL : `https://<PROJECT_ID>.web.app`

## Structure Firebase

| Service | Usage |
|---------|-------|
| **Auth** | Comptes utilisateurs (email/mot de passe) |
| **Firestore** | `userPlants`, `wishlist`, `careEvents` |
| **Hosting** | App React (SPA) |
| **FCM** | Notifications push navigateur |

## Collections Firestore

```
userPlants/{id}   — plantes du jardin (userId, plantId, pot, substrat, engrais…)
wishlist/{id}     — wishlist (userId, plantId, notes)
careEvents/{id}   — historique des soins (fertilize, water, repot)
```

Les règles de sécurité limitent chaque document à son propriétaire (`userId == auth.uid`).

## Dépannage

| Problème | Solution |
|----------|----------|
| `project id already taken` | Choisissez un ID unique : `./scripts/setup-firebase.sh plantaddict-votrenom` |
| Auth ne fonctionne pas | Vérifiez Email/Password activé dans la Console |
| Notifications refusées | Autorisez les notifications dans le navigateur + VAPID key |
| Mode démo affiché | `.env` manquant ou incomplet — relancez `setup:firebase` |
