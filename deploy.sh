#!/bin/bash

# Script per pubblicare il sito CampFlow su GitHub Pages
# Questo script deve essere eseguito dal branch 'website-only'

echo "🚀 Inizio processo di pubblicazione..."

# 1. Verifica di essere nel branch corretto
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "website-only" ]; then
  echo "❌ Errore: Questo script deve essere eseguito dal branch 'website-only'."
  exit 1
fi

# 2. Build del progetto
echo "📦 Generazione build statica..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Errore durante la build. Interruzione."
  exit 1
fi

# 3. Preparazione cartella temporanea
echo "📂 Preparazione file..."
rm -rf ../campflow_deploy_temp
cp -r out ../campflow_deploy_temp

# 4. Spostamento su gh-pages
echo "🔄 Passaggio al branch gh-pages..."
git stash
git checkout gh-pages

# 5. Pulizia e aggiornamento file
echo "🧹 Pulizia branch gh-pages..."
git rm -rf .
cp -r ../campflow_deploy_temp/* .
rm -rf ../campflow_deploy_temp

# 6. Ripristino file speciali
touch .nojekyll
echo "node_modules/" > .gitignore
echo ".next/" >> .gitignore
echo ".env*" >> .gitignore
echo ".DS_Store" >> .gitignore

# 7. Commit e Push
echo "📤 Invio modifiche su GitHub..."
git add .
git commit -m "deploy: update site from website-only $(date +'%Y-%m-%d %H:%M:%S')"
git push origin gh-pages -f

# 8. Ritorno al branch di lavoro
echo "🔙 Ritorno al branch website-only..."
git checkout website-only
git stash pop

echo "✅ Pubblicazione completata con successo!"
echo "Il sito sarà aggiornato tra pochi istanti a: https://simo-hue.github.io/CampFlow"
