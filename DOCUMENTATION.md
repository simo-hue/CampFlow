# CampFlow PMS - Documentazione Scelte Implementative

## 📋 Informazioni Generali

**Progetto**: CampFlow - Property Management System per Campeggio  
**Tipo**: Gestionale Reception per 300 piazzole  
**Data Inizio**: 18 Gennaio 2026  
**Tech Stack**: Next.js 15, TypeScript, Supabase (PostgreSQL), Tailwind CSS, Shadcn/UI

---

## 🎯 Obiettivi di Progetto

1. **Velocità di esecuzione**: Dashboard deve caricarsi in <500ms
2. **Integrità dei dati**: Zero possibilità di overbooking tramite constraint database
3. **UX Reception**: Interfaccia ottimizzata per operatori telefonici
4. **Scalabilità**: Architettura pronta per 300 piazzole + future estensioni

---

## 🏗️ Scelte Architetturali

### 1. Next.js App Router (invece di Vite + Fastify separati)

**Decisione**: Utilizzare Next.js 15 con App Router come piattaforma unificata frontend+backend.

**Motivazioni**:
- **Semplificazione deployment**: Un singolo progetto invece di due repository separati
- **API Routes integrate**: Elimina problemi CORS e semplifica la gestione delle chiamate
- **Server-Side Rendering**: Migliora il tempo di caricamento iniziale del dashboard
- **TypeScript condiviso**: Tipi comuni tra client e server senza duplicazione
- **Futuro-proof**: Possibilità di estendere con un portale clienti pubblico (SSR/SEO)

**Alternativa considerata**: Vite (React SPA) + Fastify backend separato
- ✅ Maggiore separazione frontend/backend
- ❌ Maggiore complessità di deployment
- ❌ Due progetti da mantenere
- ❌ Gestione CORS necessaria

---

### 2. PostgreSQL `tsrange` per Date di Prenotazione

**Decisione**: Utilizzare il tipo nativo `TSRANGE` per memorizzare periodi di prenotazione.

**Motivazioni**:
- **Efficienza query**: Gli operatori `&&` (overlap) e `@>` (contains) sono ottimizzati in PostgreSQL
- **GIST Index**: Supporto nativo per indici spaziali/temporali
- **Anti-overbooking atomico**: Constraint a livello database (vedi punto 3)
- **Meno errori**: Un solo campo invece di due (`start_date`, `end_date`) riduce inconsistenze

**Struttura**:
```sql
booking_period TSRANGE NOT NULL
-- Esempio: '[2026-02-01 00:00:00, 2026-02-05 00:00:00)'
-- '[' = inclusive, ')' = exclusive
```

**Alternativa considerata**: Due colonne separate `check_in DATE` e `check_out DATE`
- ✅ Più intuitivo per sviluppatori junior
- ❌ Richiede due colonne nei JOIN
- ❌ Constraint anti-overbooking più complesso
- ❌ Performance leggermente inferiore

---

### 3. GIST Exclusion Constraint (Anti-Overbooking a Livello Database)

**Decisione**: Implementare il vincolo anti-overbooking tramite `EXCLUDE USING GIST`.

**SQL Implementato**:
```sql
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled'));
```

**Motivazioni**:
- **Garanzia fisica**: Impossibile inserire sovrapposizioni, anche con race conditions
- **Zero logica applicativa**: Il database gestisce automaticamente la validazione
- **Performance**: GIST index è molto efficiente per query range
- **Error handling pulito**: PostgreSQL restituisce codice errore `23P01` che intercettiamo nell'API

**Come funziona**:
1. Tentativo di INSERT con date sovrapposte
2. PostgreSQL controlla internamente l'indice GIST
3. Se trova sovrapposizione: ROLLBACK con errore 23P01
4. API intercetta l'errore e restituisce 409 Conflict

**Alternativa considerata**: Lock ottimistico a livello applicazione
- ✅ Più controllo sulla logica di validazione
- ❌ Race conditions possibili tra check e insert
- ❌ Più codice da mantenere
- ❌ Necessita di retry logic complessa

---

### 4. Calcolo Prezzi Stagionali Server-Side

**Decisione**: Calcolare i prezzi nel file `lib/pricing.ts` durante la creazione della prenotazione.

**Logica implementata**:
```typescript
// Alta stagione (Giugno-Agosto): +40%
// Media stagione (Maggio, Settembre): prezzi standard
// Bassa stagione (Ottobre-Aprile): -20%

const HIGH_SEASON_RATES = {
  standard: 35€, comfort: 50€, premium: 75€
};
```

**Motivazioni**:
- **Integrità**: Prezzo salvato nel DB, non ricalcolato dopo
- **Audit trail**: Prezzi storici immutabili
- **Personalizzazione futura**: Facile aggiungere promozioni/override
- **Trasparenza**: Funzione `getPriceBreakdown()` mostra dettaglio per notte

**Alternativa considerata**: Prezzi fissi in tabella separata
- ✅ Maggiore flessibilità dinamica
- ❌ Più complesso da gestire per utenti non tecnici
- ❌ Overhead di JOIN per ogni prenotazione

---

### 5. Dashboard Stats con Funzioni PostgreSQL

**Decisione**: Creare funzioni SQL per conteggi giornalieri invece di query complesse nell'API.

**Funzioni create**:
```sql
CREATE FUNCTION count_arrivals_today(target_date DATE) RETURNS INTEGER
CREATE FUNCTION count_departures_today(target_date DATE) RETURNS INTEGER
```

**Motivazioni**:
- **Performance**: Query pre-compilate e ottimizzate da PostgreSQL
- **Riusabilità**: Funzioni chiamabili da API, trigger, o report esterni
- **Manutenibilità**: Logica business centralizzata nel database
- **Cache**: PostgreSQL può cachare i piani di esecuzione

**Alternativa considerata**: Query dirette nell'endpoint `/api/stats`
- ✅ Tutto il codice in TypeScript
- ❌ Più lento (parsing query ogni volta)
- ❌ Logica duplicata se servono report aggiuntivi

---

### 6. Auto-Refresh Dashboard (30 secondi)

**Decisione**: `QuickStatsWidget` richiama `/api/stats` ogni 30 secondi tramite `setInterval`.

**Motivazioni**:
- **Real-time sufficiente**: Reception non richiede aggiornamenti istantanei
- **Basso overhead**: 2 richieste al minuto per client
- **Nessun WebSocket**: Evita complessità di connessioni persistenti

**Implementazione**:
```typescript
useEffect(() => {
  fetchStats();
  const interval = setInterval(fetchStats, 30000);
  return () => clearInterval(interval);
}, []);
```

**Alternativa considerata**: WebSocket con notifiche push
- ✅ Aggiornamenti istantanei
- ❌ Overhead server significativo
- ❌ Gestione reconnection complessa
- ❌ Non necessario per questo use case

---

### 7. Gestione Clienti: Update Or Insert Pattern

**Decisione**: Cercare cliente esistente per telefono, altrimenti crearne uno nuovo.

**Logica nell'endpoint `/api/bookings` (POST)**:
```typescript
// 1. Cerca cliente esistente per telefono
const existingCustomer = await supabase
  .from('customers')
  .select('id')
  .eq('phone', body.customer.phone)
  .single();

// 2. Se esiste: aggiorna dati, altrimenti: crea nuovo
```

**Motivazioni**:
- **Prevenzione duplicati**: Stesso numero telefono = stesso cliente
- **Aggiornamento automatico**: Se il cliente cambia email, viene aggiornata
- **UX veloce**: Reception non deve cercare manualmente il cliente esistente

**Alternativa considerata**: Cliente sempre nuovo
- ✅ Più semplice
- ❌ Database pieno di duplicati
- ❌ Storico prenotazioni frammentato

---

### 8. UI Library: Shadcn/UI + Tailwind

**Decisione**: Utilizzare Shadcn/UI (componenti copiabili) invece di librerie pesanti.

**Motivazioni**:
- **Customizzabilità totale**: Copiamo i componenti nel progetto, non sono black-box
- **Zero dipendenze runtime**: Solo dev dependencies
- **Design consistente**: Sistema di design tokens con Tailwind
- **Performance**: Nessun bundle extra, solo il codice che usiamo

**Componenti integrati**:
- Card, Button, Input, Badge, Progress
- Table (per risultati availability)
- Command (global search Ctrl+K)
- Calendar (date picker futuro)

**Alternativa considerata**: Material-UI o Ant Design
- ✅ Componenti pronti all'uso
- ❌ Bundle size > 200KB
- ❌ Difficile customizzare profondamente
- ❌ Design opinato difficile da cambiare

---

### 9. Type Safety: TypeScript Shared Types

**Decisione**: File `lib/types.ts` centralizzato per tipi comuni client/server.

**Tipi definiti**:
```typescript
type PitchType = 'standard' | 'comfort' | 'premium';
interface Booking { ... }
interface CreateBookingRequest { ... }
interface DashboardStats { ... }
```

**Motivazioni**:
- **Type safety end-to-end**: Da form a database
- **Autocompletamento IDE**: Sviluppo più veloce
- **Refactoring sicuro**: Errori a compile-time invece di runtime
- **Documentazione**: Tipi servono come spec API

---

### 10. Indicizzazione Database

**Decisione**: 8 indici strategici per ottimizzare le query più frequenti.

**Indici creati**:
1. `idx_bookings_period` (GIST): Query availability overlap
2. `idx_bookings_pitch_id` (B-tree): Join bookings → pitches
3. `idx_bookings_dates` (Composite): Arrivals/departures today
4. `idx_pitches_type` (B-tree): Filtro per tipo piazzola
5. `idx_customers_phone` (B-tree): Ricerca cliente per telefono

**Motivazioni**:
- **Query <100ms**: Anche con migliaia di prenotazioni
- **Trade-off controllato**: Più indici = write più lente, ma read molto più veloci
- **Use case specifico**: Reception fa molte più letture che scritture

**Benchmark atteso** (con 10,000 bookings):
- Availability query: ~50ms
- Stats query: ~20ms
- Customer search: ~10ms

---

## 🚀 Ottimizzazioni Future Pianificate

### Fase 2 (non implementate ora):
1. **Mappa SVG Interattiva**: `MapPlaceholder` sostituito con SVG cliccabile
2. **Timeline Eventi Reale**: Collegare `TimelinePreview` alle query DB
3. **Customer Search API**: Implementare `/api/customers` per GlobalSearchBar
4. **Booking Modal**: Form completo per creare prenotazioni direttamente dalla UI
5. **Filtri Avanzati**: Ricerca pitch per attributi (ombra, dimensione, etc.)
6. **Export PDF/Excel**: Report occupazione e fatturazione
7. **Multi-utente**: Autenticazione e permessi con Supabase Auth

### Considerazioni Scaling:
- **Read Replicas**: Se il carico aumenta, Supabase supporta repliche read-only
- **Connection Pooling**: Già gestito da Supabase (PgBouncer)
- **CDN**: Next.js su Vercel con CDN edge automatico
- **Caching**: Aggiungere Redis per cache stats (se necessario)

---

## 📊 Metriche di Successo

### Performance Target:
- ✅ Dashboard load: < 500ms (TTFB)
- ✅ Availability query: < 100ms
- ✅ Booking creation: < 200ms
- ✅ Zero overbooking errors in produzione

### Code Quality:
- ✅ TypeScript strict mode abilitato
- ✅ Zero ESLint errors
- ✅ Tutti i componenti UI responsive

---

## 🔒 Sicurezza

### Supabase Row Level Security (RLS):
**Stato**: Da implementare in Fase 2 (quando aggiungeremo autenticazione)

**Pianificato**:
```sql
-- Solo staff autenticato può inserire/modificare bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true);
```

### API Routes:
- **Attualmente**: Pubbliche (OK per MVP interno)
- **Produzione**: Aggiungere middleware auth

---

## 📝 Changelog Decisioni

### 2026-01-19 - UI Refinement: Seasonal Pricing Colors
- ✅ Limitati i preset colori stagioni a 3 opzioni (Verde, Blu, Rosso) + selettore custom.

### 2026-01-19 - Fix: Build Error
- ✅ Risolto errore di export in `api/pricing/seasons` utilizzando l'istanza corretta `supabaseAdmin` in `src/app/api/pricing/seasons/route.ts`.


### 2026-01-18 - Sector Occupancy Viewer
- ✅ Sostituita mappa SVG con visualizzazione settoriale
- ✅ Implementati 6 settori (50 piazzole ciascuno)
- ✅ Aggiunta vista griglia con color-coding (verde=libera, rosso=occupata)
- ✅ Creati 2 nuovi endpoint API: `/api/pitches/sector` e `/api/occupancy`
- **Motivazione**: Più pratico per reception che mappa statica. Permette vista immediata disponibilità per range date personalizzato.

### 2026-01-18 - Setup Iniziale
- ✅ Scelto Next.js App Router vs Vite+Fastify
- ✅ Implementato tsrange + GIST exclusion
- ✅ Creato pricing calculator stagionale
- ✅ Dashboard components completi (5 widgets)
- ✅ API routes: /availability, /stats, /bookings

### 2026-01-18 - Fix: Configurazione Environment
- ⚠️ Identificata necessità di `SUPABASE_SERVICE_ROLE_KEY` per operazioni server-side amministrative (es. caricamento piazzole).

### 2026-01-18 - UI Update: Dark Mode
- ✅ Impostato tema "Dark" come predefinito tramite `next-themes`.
- ✅ Aggiunto `ThemeProvider` con `suppressHydrationWarning` per evitare flash.

### 2026-01-18 - Feature: Gestione Campeggio Completa
- ✅ Creata UI per CRUD completo piazzole (Add, Edit, Delete).
- ✅ Implementato dialog per gestione attributi (ombra, luce, acqua, etc.).
- ✅ Integrata logica di sdoppiamento (es. 10 -> 10a/10b) e unione piazzole.
- ✅ Semplificata gestione tipi piazzola: solo "Piazzola" e "Tenda" (rimossi standard/comfort/premium) per richiesta utente.
- ✅ Aggiunto selettore "Settore" in Gestione Campeggio per filtrare piazzole per range numerici (es. Settore 1: 1-60).


### 2026-01-18 - Fix: Timezone Italia
- ✅ Forzato l'uso di 'Europe/Rome' per tutte le date server-side (Today, Stats).
- ✅ Risolto problema disallineamento UTC (prenotazioni "ieri" o "domani" errate).
- ✅ Introdotto helper `getTodayItaly()` in `lib/utils` per centralizzare la logica.

### 2026-01-18 - Simplification: Pitch Management
- ✅ Rimosso tutti gli attributi piazzola (mq, shade, water, etc.) da UI e DB.
- ✅ Aggiunto switch "Crea doppia (a/b)" direttamente nel dialog di creazione.
- ✅ Form creazione ridotto ai minimi termini: Numero + Tipo.

### 2026-01-18 - Schema Update
- ✅ Aggiornato `supabase/schema.sql` per riflettere le modifiche UI.
- ✅ Rimossi attributi di esempio nel seed data (ora `{}`).
- ✅ Rimossi attributi di esempio nel seed data (ora `{}`).
- ✅ Verificata presenza tabella `booking_guests` nello schema.

### 2026-01-18 - Validation Update
- ✅ Implementato controllo lato server per duplicati Piazzola (Numero + suffisso).
- ✅ Aggiunta validazione regex per garantire che il numero sia un intero.
- ✅ Gestione errore UI nel dialog di creazione.
- ✅ **Fix Input**: Il campo "Numero" ora accetta solo cifre (blocco input client-side).

### 2026-01-18 - Feature: Save Button Pricing
- ✅ Aggiunto pulsante "Salva Modifiche" nel pannello Prezzi.
- ✅ Rimosso salvataggio automatico (auto-save) per evitare scritture.
- ✅ Feedback visivo "Modifiche Salvate" temporaneo.

### 2026-01-18 - UI Update: Full Width Settings
- ✅ Espansi pannelli "Prezzi" e "Aspetto" per usare tutta la larghezza disponibile.
- ✅ Migliorata leggibilità su schermi larghi.

---

### 2026-01-19 - Arrivals & Departures Refactor
- ✅ Create due nuove pagine `/arrivals` e `/departures` accessibili dalla dashboard.
- ✅ Implementati componenti condivisi `GuestCard` e `DateToggle` per coerenza UI.
- ✅ Supporto per visualizzazione "Oggi" e "Domani" con caricamento dinamico API.
- ✅ UI unificata con indicatori visivi (Verde per Arrivi, Blu per Partenze).
- ✅ Tipi TypeScript condivisi in `src/types/dashboard.ts`.

### 2026-01-19 - QuickStats Navigation
- ✅ Resi cliccabili i box "Arrivi Oggi" e "Partenze Oggi" nel `QuickStatsWidget`.
- ✅ Collegati direttamente alle pagine `/arrivals` e `/departures`.
- ✅ Aggiunto effetto hover per migliorare l'UX.

### 2026-01-19 - Full Screen Layout & Search
- ✅ Refactoring pagine `/arrivals` e `/departures` per utilizzo Full Screen (rimosso container limitato).
- ✅ Implementato Header sticky con barra di ricerca client-side (filtro per nome o piazzola).
- ✅ Layout a griglia responsiva per le card (da 1 a 4 colonne).
- ✅ Migliorata UX con visualizzazione "Empty State" personalizzata.

**Documento vivo**: Aggiornare questo file ad ogni scelta implementativa significativa.
