# 🪴 Plant Tracker

Application web (Next.js 14 + Prisma + SQLite) pour les **plant addicts**
exigeants. Permet de :

- Parcourir une **bibliothèque de 40+ plantes** documentées (lumière, T°,
  hygrométrie, besoins en engrais, NPK conseillé, toxicité, etc.).
- Choisir son **substrat** parmi 12 mélanges classiques (terreau universel,
  mélange aroïde chunky, LECA, pon, fibre de coco, sphaigne, écorce
  d'orchidée, akadama…).
- Constituer son **portefeuille** (collection) avec, pour chaque plante :
  surnom, emplacement, **volume de pot en litres** et **substrat**.
- Calculer automatiquement la **dose exacte d'engrais en mL** à mettre dans
  l'eau d'arrosage, en tenant compte du **volume du pot**, du **substrat**
  et du **profil engrais** de la plante.
- Recevoir des **rappels** (in-app et notifications push web) quand la
  prochaine fertilisation tombe.
- Gérer une **wishlist** des plantes à acquérir.

> Cette version est volontairement opinionnée : auth par cookie + mot de
> passe, données stockées en SQLite par défaut. Aucun service externe
> obligatoire. Vous pouvez l'auto-héberger ou la déployer sur Vercel /
> Railway / Fly.io.

---

## 🧪 Calcul de la dose d'engrais

Le moteur (`src/lib/fertilizer.ts`) combine trois facteurs :

```
doseParLitreEau = baseDoseMlPerLiter(plante)
                × fertMultiplier(substrat)
                × multiplicateurBesoin(LIGHT 0.6 | MEDIUM 1.0 | HEAVY 1.3)

volumeArrosage  = max(50 mL, min(1.5 L, 20 % × volumeDuPot))
doseTotale (mL) = (volumeArrosage / 1 000) × doseParLitreEau
                  (arrondie à 0,1 mL, minimum 0,1 mL)

frequence (j)   = max(3,
                      frequenceBaseSelonSaison(plante)
                      + fertFrequencyShiftDays(substrat))
```

La saison est détectée automatiquement (avril → septembre = saison de
croissance, sinon repos végétatif).

### Pourquoi un multiplicateur de substrat ?

| Substrat                | Multiplicateur dose | Décalage fréquence |
|-------------------------|--------------------:|-------------------:|
| Terreau universel       | 1.0                 | 0 j                |
| Terreau plantes vertes  | 0.8                 | +7 j               |
| Mélange aroïde chunky   | 1.15                | −2 j               |
| Fibre de coco           | 1.2                 | −3 j               |
| LECA (semi-hydro)       | 1.4                 | −7 j               |
| Pon (Lechuza)           | 0.7                 | +14 j              |
| Sphaigne                | 1.1                 | −3 j               |
| Tourbe blonde (carnivores) | 0.3              | +30 j              |
| …                       |                     |                    |

Les substrats inertes (LECA, fibre coco, sphaigne) **n'ont pas** de
nutriments propres : il faut donc fertiliser plus souvent et un peu plus
fort. Les substrats pré-fertilisés (Pon, terreau plantes vertes) demandent
au contraire moins d'apports.

Le détail des coefficients est dans `prisma/seed.ts`. Tout peut être
réajusté à la console Prisma sans toucher au code.

---

## 🚀 Démarrer en local

```bash
# 1. Installer les dépendances
cd plant-tracker
npm install

# 2. Configurer l'environnement
cp .env.example .env
# (renseigner AUTH_SECRET ; optionnel : générer des clés VAPID)
#   npx web-push generate-vapid-keys

# 3. Créer la base SQLite + seed
npm run db:reset        # = prisma db push --force-reset && seed

# 4. Lancer en dev
npm run dev             # http://localhost:3000
```

Pour reset uniquement les données :

```bash
rm prisma/dev.db
npm run db:reset
```

---

## 🏗 Architecture

```
plant-tracker/
├─ prisma/
│  ├─ schema.prisma        # User, Plant, Substrate, UserPlant, Wishlist,
│  │                       # CareEvent, Notification, PushSubscription
│  └─ seed.ts              # 12 substrats + 40 plantes
├─ src/
│  ├─ lib/
│  │  ├─ db.ts             # Prisma singleton
│  │  ├─ auth.ts           # JWT (jose) + bcryptjs, cookie httpOnly
│  │  ├─ session.ts        # getCurrentUser / requireUser
│  │  ├─ fertilizer.ts     # Cœur du moteur de calcul
│  │  ├─ notifications.ts  # web-push (VAPID) envoi push
│  │  ├─ plant-types.ts    # Unions littérales partagées (SQLite n'a pas
│  │  │                    # de type enum)
│  │  └─ format.ts         # Dates relatives FR
│  ├─ app/                 # App Router
│  │  ├─ page.tsx          # Landing / dashboard
│  │  ├─ library/          # bibliothèque + détail
│  │  ├─ collection/       # mes plantes + détail + ajout
│  │  ├─ wishlist/
│  │  ├─ notifications/
│  │  ├─ login/, signup/
│  │  └─ api/              # toutes les routes JSON
│  └─ components/          # UI réutilisables
└─ public/sw.js            # service worker push
```

### Authentification

Cookie httpOnly `pt_session` contenant un JWT signé HS256 via `jose`. Pas
de NextAuth pour rester léger ; on peut le brancher plus tard si besoin
d'OAuth.

### Notifications

Deux niveaux :

1. **In-app** : les enregistrements `Notification` sont lus à chaque
   chargement (`/notifications`, badge dans la nav, dashboard).
2. **Push web** : optionnel. Si `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`
   sont définis, l'utilisateur peut activer la souscription dans
   `/notifications`. Une route `/api/cron/dispatch` à appeler
   périodiquement (cron service ou GitHub Actions, idéalement toutes les
   5–15 min) envoie les push pour les rappels dont `dueAt <= now`.

Exemple cron (toutes les 10 min) :

```bash
*/10 * * * * curl -s -H "x-cron-secret: $CRON_SECRET" \
  https://votre-domaine/api/cron/dispatch >/dev/null
```

---

## 🧭 Décisions de design et idées pour la suite

Pendant l'implémentation, plusieurs choix par défaut ont été pris faute
de retours utilisateur. Ils sont tous **modifiables sans refacto majeur** :

- **SQLite** plutôt que Postgres : zéro setup pour démarrer. Pour migrer,
  changer la `datasource` Prisma + réintroduire les vrais `enum`.
- **Saison** : détection « hémisphère nord ». À paramétrer par utilisateur
  (futur champ `User.hemisphere`).
- **Engrais de référence** : on suppose un liquide standard NPK ~6-3-6
  dilué à 1 g/L. La dose mL/L se réinterprète comme un **ratio de
  dilution** pour d'autres formules.
- **Volume d'arrosage** : 20 % du volume du pot (capé à 1,5 L). Bonne
  approximation moyenne, mais on pourrait l'ajuster par espèce
  (succulentes 10 %, fougères 25 %).
- **Wishlist** : pas encore de tri par disponibilité chez un revendeur ni
  d'alerte « plante dispo près de chez moi » — ce serait un chouette
  add-on (scrape d'API de pépiniéristes / lemarchedeleon, etc.).

### Idées futures (ranking suggéré)

1. **Multi-tâches** : étendre les rappels au-delà de la fertilisation
   (arrosage, rotation, traitement préventif, rempotage annuel).
2. **Photos & journal de croissance** : upload + frise temporelle par
   plante (le modèle `CareEvent` est déjà prêt).
3. **Détection saisonnière avancée** via géolocalisation/latitude.
4. **Calcul d'EC** : pour les utilisateurs de fertilisation hydroponique
   précise (cible mS/cm en fonction de l'âge de la plante).
5. **Partage** : exporter sa collection / suivre celle d'amis.
6. **PWA installable** (manifest + service worker amélioré).
7. **Import depuis Plant Net / Pl@ntNet API** pour identifier une plante
   à partir d'une photo.

---

## 🔧 Variables d'environnement

| Variable                        | Obligatoire | Description                              |
|---------------------------------|:-----------:|------------------------------------------|
| `DATABASE_URL`                  | ✅          | `file:./dev.db` ou URL Postgres.         |
| `AUTH_SECRET`                   | ✅          | Min 16 caractères. Signature JWT.        |
| `VAPID_PUBLIC_KEY`              |             | Active le push web.                       |
| `VAPID_PRIVATE_KEY`             |             | idem.                                     |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`  |             | Miroir public pour le navigateur.         |
| `VAPID_CONTACT`                 |             | `mailto:…` pour l'opérateur push.         |
| `CRON_SECRET`                   |             | Protège `/api/cron/dispatch`.             |

---

## 🧹 Scripts

| Script              | Description                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Démarrer en mode dev (port 3000).            |
| `npm run build`     | Build production (compile Prisma + Next).    |
| `npm run start`     | Démarrer le serveur prod.                    |
| `npm run db:push`   | Appliquer le schéma à la DB.                 |
| `npm run db:seed`   | Insérer/mettre à jour le catalogue.          |
| `npm run db:reset`  | Reset + seed.                                |

---

## ❓ Choix à valider avec vous

Quelques questions ouvertes à arbitrer pour la prochaine itération :

1. **Hémisphère** : faut-il un toggle par utilisateur ou détection par
   géoloc ?
2. **Engrais** : voulez-vous saisir votre marque/formule précise (NPK +
   concentration) pour que les doses s'adaptent automatiquement ?
3. **Arrosage** : veut-on aussi planifier les arrosages (on a déjà les
   champs `wateringDaysSummer/Winter` côté Plant et `lastWateredAt` côté
   UserPlant) ?
4. **Photos** : prêt à upload S3/Vercel Blob ou on reste sur URL externe ?
5. **Bibliothèque** : 40 plantes pour démarrer — voulez-vous en prioriser
   d'autres (philodendrons rares, anthuriums spéciaux, hoyas) ?
6. **PWA** : besoin d'une vraie app installable sur mobile ?
