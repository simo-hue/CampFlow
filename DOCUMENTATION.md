# Documentazione CampFlow

## 1. Dashboard

### 1.1 Ricerca Disponibilità (Availability Search)
**Stato**: Implementato
**Descrizione**:
La sezione "Cerca Piazzole Disponibili" nella dashboard è stata aggiornata per offrire un'esperienza utente più fluida.
- **Auto-Search**: Il pulsante "Cerca" è stato rimosso. La ricerca avviene automaticamente non appena vengono selezionate entrambe le date di arrivo e partenza.
- **Risultati**: La tabella dei risultati appare solo quando la ricerca ha prodotto dei dati. Se le date non sono selezionate o sono incomplete, l'area dei risultati rimane vuota per mantenere l'interfaccia pulita.
- **Validazione**: La ricerca non parte se manca una delle due date.
- **Debounce**: Implementato un leggero ritardo (500ms) per evitare chiamate API eccessive durante la selezione rapida.

**File Coinvolti**:
- `src/components/dashboard/AvailabilityModule.tsx`: Componente principale refactorizzato per usare `useEffect` al posto di `handleSearch`.

## 2. Customer Management
**Stato**: Aggiornato (2026-01-19)

### 2.1 Schema Dati Cliente (Customers Table)
La tabella `customers` è stata estesa per supportare le richieste della Pubblica Sicurezza e dati statistici.

**Nuovi Campi**:
- **Anagrafica**:
  - `first_name`, `last_name` (Sostituisce `full_name`)
  - `birth_date` (Data di nascita)
  - `birth_country`, `birth_city`, `birth_province` (Luogo di nascita)
  - `citizenship` (Cittadinanza)
  - `gender` (Sesso: M/F/Other)
- **Residenza**:
  - `residence_country`, `residence_city`, `residence_province`, `residence_zip`
  - `address` (Indirizzo via/civico)
- **Documenti**:
  - `document_type` (Carta Identità, Passaporto, Patente, Altro)
  - `document_number`
  - `document_issue_date`, `document_issue_place` (Comune/Ente), `document_issue_country`

### 2.2 Creazione Prenotazione
Il modale di creazione ora include:
- **Autocomplete Clienti**: Una barra di ricerca permette di trovare rapidamente clienti esistenti per nome, telefono o email.
- **Validazione Strict**: Previene la sovrascrittura accidentale di clienti esistenti quando si inseriscono nuovi ospiti con lo stesso numero di telefono.
- **GET /api/customers**: Ricerca per nome, cognome, email o telefono.
- **POST /api/customers**: Creazione cliente con supporto per tutti i nuovi campi.
- **POST /api/bookings**: Supporta creazione atomica Cliente + Prenotazione. 
  - **Logica Strict Matching**: Se non viene fornito un ID cliente esplicito, il sistema cerca un match per **Telefono + Nome + Cognome**. 
  - Se tutti e tre coincidono, usa il cliente esistente. 
  - Se il telefono coincide ma il nome differisce, crea un **NUOVO** cliente (per gestire omonimie o familiari con stesso cellulare).
  - Se viene fornito `customer_id` (da Autocomplete), quel cliente viene usato e i suoi dati secondari (email, indirizzo) vengono aggiornati senza alterare il nome.

### 2.3 Pagina Clienti (Lista e Dettaglio)
**Stato**: Refactoring UI (2026-01-19)
**Nuova Implementazione**:
- **Lista Clienti (`/customers`)**: 
  - **Layout Full Screen Dashboard**: Visualizzazione a schermo intero con lista scrollabile e header centrale fisso.
  - **Card Grid**: Lista interattiva con effetti hover e icone per i contatti.
  - Ricerca ottimizzata con debounce.
- **Dettaglio Cliente (`/customers/[id]`)**: 
  - **Layout Responsive Full Screen**:
      - Header e Controlli Tab centrati.
      - Contenuto scrollabile indipendentemente.
  - **Editing Completo**: La modalità modifica sblocca tutti i campi.

## 3. Arrivals and Departures UI Refactor
### Date: 2026-01-19
### Changes
- **Redesigned GuestCard**: Converted from a grid card to a horizontal row layout for better information density and professionalism. Uses `shadcn/ui` Card component.
- **Arrivals Page**:
  - Switched to a list layout (`space-y-4`).
  - Added summary statistics in the header (e.g., total count).
  - Improved sticky header with backdrop blur.
  - Enhanced empty state with better messaging.
- **Departures Page**:
  - Mirrored the Arrivals page layout improvements.
  - Applied Blue theme consistent with "Departure" status.
  - Same responsive and list-based improvements.

## 4. Statistics Dashboard
**Stato**: Implementato (2026-01-19)
**Descrizione**:
Implementata una nuova pagina `/stats` per la visualizzazione delle performance del campeggio.
- **Libreria Grafica**: `recharts` con styling personalizzato per un look moderno e pulito.
- **Funzionalità**:
    - **Filtri Temporali**: Tab per selezionare rapidamente ultimi 7gg, 30gg, 3 mesi, o Anno Corrente.
    - **KPI Cards**: Card riassuntive per Ricavi totali, Tasso di occupazione medio, Numero prenotazioni e Durata media soggiorno.
    - **Grafici**:
        - **Trend Ricavi**: Grafico ad area con sfumature (gradient fill) per visualizzare l'andamento del fatturato.
        - **Occupazione**: Grafico a barre per mostrare il numero di piazzole occupate giorno per giorno.
        - **Nazionalità**: Grafico a ciambella (Donut) per la distribuzione geografica degli ospiti (Top 5 paesi).
- **Integrazione**: Aggiunto link "Statistiche" nell'header di navigazione (icona Grafico).
- **Logica**: I dati vengono calcolati aggregando giorno per giorno le prenotazioni attive che si sovrappongono al periodo selezionato.

## 5. Check-in Refactoring
**Stato**: Refactoring UI (2026-01-20)
**Descrizione**:
La pagina di Check-in è stata ridisegnata per allinearsi al nuovo stile "Dashboard".
- **Visual Design**:
    - **Full Viewport Height**: Layout a schermo intero senza scroll globale.
    - **Intestazione Centrata**: Titolo e ricerca al centro per massima pulizia.
    - **Lista Scrollabile**: Area centrale dedicata allo scroll delle prenotazioni.
    - **Card Design**: Stile consistente con la lista clienti (bordi colorati, icone, badge).
- **Modale Check-in**: 
    - Convertito il form di check-in da inline (fondo pagina) a un componente `Dialog` (Modal) di Shadcn UI (mantenuto nella logica ma integrato visivamente).
- **Workflow**: 
    1. Ricerca prenotazione (filtrata realtime).
    2. Click su "Effettua Check-in" apre il modale.
    3. Completamento dati anagrafici, residenza e documenti.
    4. Conferma e invio Questura.
- **Funzionalità Geografiche**:
    - **Autocomplete**: Integrata ricerca intelligente per Comuni e Province italiane.
    - **Auto-Fill**: Selezione comune compila provincia, CAP e normalizza il nome.
