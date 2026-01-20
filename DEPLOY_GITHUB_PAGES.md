# 🌍 Deploy su GitHub Pages (Solo Sito Web)

## 4. Dominio Personalizzato o Sottodominio
Dato che il tuo repository si chiama `CampFlow` (presumo), il sito sarà visibile su:
`https://simo-hue.github.io/CampFlow/`

⚠️ **Attenzione ai percorsi**:
Se il sito non carica CSS o immagini, potrebbe essere perché il base path non è configurato.
Su GitHub Pages, se non usi un dominio personalizzato, il sito è in una sottocartella (`/CampFlow`).
Per fixare questo nel prossimo deploy, dovresti aggiungere `basePath: '/CampFlow'` in `next.config.ts`, ma **solo per la build GitHub**.

**Consiglio:** Se hai un dominio tuo (es. `www.campflow.it`), collegalo subito a GitHub Pages. In quel caso non serve nessuna configurazione path extra.

## 🎉 Fine!
Il tuo sito vetrina è online. La dashboard rimarrà privata sul tuo computer (`npm run dev`).
