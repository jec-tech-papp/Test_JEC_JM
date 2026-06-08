#!/usr/bin/env bash
set -euo pipefail

# PlantAddict — Firebase project bootstrap (isolated from other repos/apps)
# Usage: ./scripts/setup-firebase.sh [project-id]

CLI="npx -y firebase-tools@latest"
PROJECT_ID="${1:-plantaddict-apps}"
DISPLAY_NAME="PlantAddict"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$DIR"

echo "==> PlantAddict Firebase setup"
echo "    Project ID: $PROJECT_ID"
echo "    Directory:  $DIR"
echo ""

# 1. Check login
if ! $CLI projects:list &>/dev/null; then
  echo "ERROR: Not logged in to Firebase."
  echo "Run: $CLI login"
  echo "Or (headless): $CLI login --no-localhost"
  exit 1
fi

# 2. Create project if missing
if ! $CLI projects:list 2>/dev/null | grep -q "$PROJECT_ID"; then
  echo "==> Creating Firebase project: $PROJECT_ID"
  $CLI projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME"
else
  echo "==> Project $PROJECT_ID already exists"
fi

# 3. Set active project
$CLI use "$PROJECT_ID"

# 4. Enable Firestore (europe-west1 for FR users)
if ! $CLI firestore:databases:list 2>/dev/null | grep -q "(default)"; then
  echo "==> Creating Firestore database (europe-west1)"
  $CLI firestore:databases:create "(default)" --location=europe-west1
fi

# 5. Enable Email/Password auth
echo "==> Enabling Email/Password authentication"
$CLI auth:export /dev/null 2>/dev/null || true
# Auth providers must be enabled in console or via REST API; guide user:
echo "    -> Enable Email/Password in: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

# 6. Create web app if needed
APPS=$($CLI apps:list WEB 2>/dev/null || echo "")
if ! echo "$APPS" | grep -q "PlantAddict"; then
  echo "==> Creating Web app"
  $CLI apps:create WEB "PlantAddict Web" --project "$PROJECT_ID"
fi

# 7. Extract SDK config → .env
echo "==> Generating .env from Firebase SDK config"
APP_ID=$($CLI apps:list WEB --json 2>/dev/null | node -e "
  const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const app=(d.result||[]).find(a=>a.displayName?.includes('PlantAddict'))||(d.result||[])[0];
  if(app) process.stdout.write(app.appId);
")

if [ -z "$APP_ID" ]; then
  echo "WARN: Could not detect Web App ID. Set VITE_FIREBASE_* manually in .env"
else
  $CLI apps:sdkconfig WEB "$APP_ID" --json | node -e "
    const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
    const c=d.result?.sdkConfig||d.sdkConfig||{};
    const lines=[
      'VITE_FIREBASE_API_KEY='+(c.apiKey||''),
      'VITE_FIREBASE_AUTH_DOMAIN='+(c.authDomain||''),
      'VITE_FIREBASE_PROJECT_ID='+(c.projectId||''),
      'VITE_FIREBASE_STORAGE_BUCKET='+(c.storageBucket||''),
      'VITE_FIREBASE_MESSAGING_SENDER_ID='+(c.messagingSenderId||''),
      'VITE_FIREBASE_APP_ID='+(c.appId||''),
      'VITE_FIREBASE_VAPID_KEY=',
    ];
    require('fs').writeFileSync('.env', lines.join('\n')+'\n');
    console.log('Wrote .env');
  "
fi

# 8. Deploy Firestore rules
echo "==> Deploying Firestore security rules"
$CLI deploy --only firestore:rules

echo ""
echo "==> Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Enable Email/Password auth in Firebase Console"
echo "  2. Add VAPID key to .env (Cloud Messaging > Web Push certificates)"
echo "  3. npm run dev          — local development"
echo "  4. npm run deploy       — build + deploy hosting"
echo ""
echo "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
