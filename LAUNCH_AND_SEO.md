# 🚀 Guida al Lancio e Ottimizzazione SEO

Ecco i passaggi fondamentali da seguire **dopo** aver pubblicato il sito per garantire la massima visibilità su Google e il corretto funzionamento tecnico.

## ⚠️ Nota Importante sull'Hosting (GitHub Pages vs Vercel)

**Attenzione:** Hai menzionato di voler usare **GitHub Pages**.
Tuttavia, **CampFlow è un'applicazione Full-Stack** (usa Database, Login, API e Middleware per la protezione delle rotte).
*   **GitHub Pages** supporta solo siti **Statici** (HTML/CSS). Se pubblichi lì, la parte "Sito web" (`/w`) funzionerà, ma **la Dashboard, il Login e le API smetteranno di funzionare**.
*   **Consiglio Vivamente:** Usa **Vercel** (che è gratuito per progetti hobbistici/open source). Supporta nativamente Next.js, le API e il Database. È la scelta standard per Next.js.

---

## 1. Indicizzazione Google (Google Search Console)

Questo è il passaggio più importante per apparire nelle ricerche.

1.  Vai su [Google Search Console](https://search.google.com/search-console).
2.  Accedi col tuo account Google e clicca **"Aggiungi proprietà"**.
3.  Inserisci il dominio del tuo sito (es. `https://campflow.app` o il tuo URL Vercel/GitHub).
4.  Verifica la proprietà (tramite DNS o caricando un file HTML se richiesto).
5.  Una volta dentro, vai nel menu a sinistra su **Sitemap**.
6.  Inserisci l'URL della sitemap: `https://tuo-dominio.com/sitemap.xml` e invia.
    *   *Questo dice a Google esattamente quali pagine scansionare.*

## 2. Indicizzazione Bing & Altri

1.  Vai su [Bing Webmaster Tools](https://www.bing.com/webmasters).
2.  Puoi importare direttamente la verifica da Google Search Console (molto veloce).
3.  Questo ti rende visibile anche su Bing, Yahoo e DuckDuckGo.

## 3. Social & Backlinks (Authority)

Per salire nel ranking, devi far capire a Google che il tuo sito è "autorevole".

1.  **GitHub Repo**: Nel tuo repository CampFlow su GitHub, vai nelle impostazioni (ingranaggio in alto a destra) e nella sezione "Website" inserisci il link al sito live.
2.  **LinkedIn**: Pubblica un post annunciando il lancio, taggando il progetto e mettendo il link nei commenti o nel post.
3.  **Sito Personale**: Assicurati che `https://simo-hue.github.io` abbia un link verso CampFlow.

## 4. Verifica Tecnica Post-Lancio

Dopo il deploy, controlla questi punti:

*   [ ] **Favicon**: Si vede l'icona della tenda nella tab del browser?
*   [ ] **Titoli**: Passando il mouse sulle tab, leggi i titoli corretti (es. "CampFlow | Gestione...")?
*   [ ] **Link Social**: I link nel footer portano ai profili giusti?
*   [ ] **Modulo Contatti**: Prova a inviare una mail dal form contatti per vedere se si apre il client di posta.
*   [ ] **Rich Snippet**: Testa il tuo URL su [Google Rich Results Test](https://search.google.com/test/rich-results) per vedere se rileva il "SoftwareApplication" (le stelline e il prezzo zero).

## 5. Aggiornamento URL

Attualmente nel codice (`sitemap.ts`, `robots.ts`, `layout.tsx`) abbiamo usato un dominio placeholder: `https://campflow.app`.
**Appena hai il dominio definitivo (es. `campflow.vercel.app` o un dominio .com):**
1.  Fai un "Cerca e Sostituisci" in tutto il progetto di `https://campflow.app` con il tuo vero dominio.
2.  Esegui un nuovo deploy.

---

**Se hai bisogno di aiuto per spostare il deploy su Vercel invece che GitHub Pages per far funzionare tutto (App + Sito), fammelo sapere!**
