# 🌿 PlantAddict

Application web de suivi de plantes d'intérieur, conçue pour les plant addicts sérieux.

## Fonctionnalités

- **Bibliothèque de plantes** : 25+ espèces avec fiches de soin détaillées (lumière, arrosage, humidité, température, fertilisation, substrats)
- **Ma collection** : Gérez vos plantes avec informations de pot (volume en litres, matière), substrat utilisé, emplacement
- **Ma wishlist** : Sauvegardez les plantes qui vous font rêver avec niveaux de priorité
- **Calculateur d'engrais** : Calcule la dose exacte de concentré en fonction du volume du pot, du substrat et de la saison
- **Suivi des soins** : Enregistrez les arrosages et fertilisations avec historique
- **Rappels** : Alertes pour les soins en retard ou à venir
- **Substrats personnalisés** : Créez vos propres mélanges avec composition détaillée

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite
- **UI** : Tailwind CSS v4 + composants custom
- **Backend** : Firebase (Auth + Firestore)
- **Routing** : React Router v7

## Installation

### 1. Prérequis

- Node.js 18+
- Un projet Firebase (gratuit)

### 2. Créer un projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créez un nouveau projet
3. Activez **Authentication** → Sign-in method → Email/Password + Google
4. Activez **Firestore Database** (mode production)
5. Dans Project Settings → Your apps → Ajoutez une Web app
6. Copiez la configuration Firebase

### 3. Configuration

```bash
cp .env.example .env.local
```

Remplissez votre `.env.local` avec les valeurs Firebase :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Règles Firestore

Dans la console Firebase → Firestore → Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userPlants/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /wishlist/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /careLogs/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /substrates/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /reminders/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Lancer l'application

```bash
npm install
npm run dev
```

## Déploiement

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Calcul des doses d'engrais

La formule utilisée est :

```
Dose (ml concentré) = Dose_base × Volume_eau × Multiplicateur_saison × Multiplicateur_substrat
```

- **Dose_base** : définie par espèce (ml de concentré par litre d'eau)
- **Volume_eau** : 80% du volume du pot par défaut (personnalisable)
- **Multiplicateur_saison** : ×1.0 printemps/été, ×0.5 automne, ×0 hiver
- **Multiplicateur_substrat** : ×1.5 pour LECA (faible rétention), ×0.5 pour cactées (très peu d'engrais)

## Plantes disponibles

| Catégorie | Exemples |
|-----------|---------|
| Aracées | Monstera deliciosa, M. adansonii, Philodendron gloriosum, P. melanochrysum, Alocasia zebrina, Anthurium clarinervium |
| Grimpantes | Pothos doré, Scindapsus argenté, Hoya carnosa, Tradescantia zebrina |
| Tropicales | Strelitzia nicolai, Calathea orbifolia, Maranta leuconeura, Bégonia rex |
| Arbres | Ficus lyrata, Ficus elastica |
| Succulentes | Echeveria elegans, Aloe vera, Haworthia, Sansevieria, ZZ Plant |
| Cactus | Cereus peruvianus, Gymnocalycium mihanovichii |
| Fougères | Nephrolepis exaltata |
| Orchidées | Phalaenopsis |
| Palmiers | Chamaedorea elegans |
| Carnivores | Dionaea muscipula, Nepenthes |
| Aromatiques | Basilic |

## Substrats pré-configurés

- Terreau universel
- Mix aracées (écorce + perlite + sphaigne)
- Mix cactées & succulentes
- Mix orchidées (écorce + sphaigne + perlite)
- Mix tropical
- LECA (argile expansée)
- Sphaigne pure
- Mix plantes carnivores
- Mix fougères
- Fibre de coco
- Mix palmiers
- **Personnalisé** : créez vos propres mélanges avec composition et multiplicateurs

---

*Note : Les doses d'engrais sont indicatives. Adaptez toujours selon les instructions du fabricant du produit utilisé.*
