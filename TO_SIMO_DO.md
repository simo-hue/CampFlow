# CampFlow - Azioni Manuali da Completare

> **⚠️ AZIONE CRITICA RICHIESTA: Chiave API Mancante**
> Il sistema non riesce a caricare le piazzole perché manca la `SUPABASE_SERVICE_ROLE_KEY` nelle variabili d'ambiente.
> **Azione**: Aggiungi `SUPABASE_SERVICE_ROLE_KEY=...` nel tuo file `.env.local` (o dove definisci le env vars per `npm run dev`).
> Questa chiave è richiesta da `src/lib/supabase/server.ts` per l'accesso amministrativo al DB.


> **🎨 AGGIORNAMENTO ore 18:45**: Aggiunto filtro "Settore" nel pannello "Gestione Campeggio".
> - Permette di filtrare piazzole per Settore 1-5 (es. 1-60, 61-120, ecc.)
> - Utile per gestire grandi quantità di dati.

> **🎨 AGGIORNAMENTO ore 18:30**: Migliorata UX pannello "Gestione Campeggio" con spaziatura ottimizzata nei filtri.

> **⚡ AGGIORNAMENTO 18/01/2026 ore 17:47**: Aggiunta tabella `booking_guests` per dettagli ospiti.
> - Workflow: Prenotazione → solo referente | Check-in → dettagli tutti gli ospiti
> - Campi: nome, data/luogo nascita, indirizzo, documento, nazionalità, tipo ospite

> **🗓️ AGGIORNAMENTO ore 17:39**: Sistema prenotazioni ora usa solo DATE (nessuna precisione oraria).
> - Database: `DATERANGE` invece di `TSRANGE`
> - Tutte le prenotazioni a livello giornaliero
> Vedi documentazione per dettagli.

> **🗓️ AGGIORNAMENTO ore 17:23**: Vista Occupazione ora mostra layout CALENDARIO con:
> - Piazzole come RIGHE
> - 14 giorni come COLONNE
> - 5 settori da 60 piazzole
> Vedi `CALENDAR_LAYOUT_UPDATE.md` per dettagli completi.

## 🔧 Setup Iniziale

### 1. Creazione Progetto Supabase
- [ ] Vai su [Supabase](https://app.supabase.com) e crea un nuovo progetto
- [ ] Nome progetto: `campflow-pms` (o come preferisci)
- [ ] Regione: Scegli la più vicina all'Italia (es. Frankfurt)
- [ ] Attendi il completamento del setup (circa 2 minuti)

### 2. Configurazione Database
- [ ] Apri l'SQL Editor nel pannello Supabase
- [ ] Copia e incolla il contenuto del file `supabase/schema.sql`
- [ ] Esegui lo script SQL (questo creerà tutte le tabelle, indici e constraint)
- [ ] Verifica che le tabelle siano state create correttamente nella sezione "Database" → "Tables"

### 3. Variabili d'Ambiente
- [ ] Nel pannello Supabase, vai su Settings → API
- [ ] Copia l'URL del progetto (`NEXT_PUBLIC_SUPABASE_URL`)
- [ ] Copia la chiave `anon public` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Copia la chiave `service_role` (`SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ MANTIENILA SEGRETA
- [ ] Crea il file `.env.local` nella root del progetto
- [ ] Incolla i valori copiati:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key
SUPABASE_SERVICE_ROLE_KEY=tua-service-role-key
```

### 4. Installazione e Avvio
- [ ] Apri il terminale nella cartella del progetto
- [ ] Esegui: `npm install` (se non già fatto)
- [ ] Esegui: `npm run dev`
- [ ] Apri il browser su `http://localhost:3000`

## ✅ Test Funzionali

### Test 1: Verifica Anti-Overbooking (CRITICO)
Questo test verifica che il constraint GIST impedisca effettivamente il doppio booking.

**Tramite SQL Editor (Supabase):**

```sql
-- 1. Inserisci una prenotazione di test
INSERT INTO bookings (pitch_id, customer_id, booking_period, guests_count, total_price, status)
VALUES (
  (SELECT id FROM pitches WHERE number = '001' LIMIT 1),
  (SELECT id FROM customers LIMIT 1), -- se non hai clienti, creane uno prima
  '[2026-02-10 00:00:00, 2026-02-15 00:00:00)',
  2,
  100.00,
  'confirmed'
);

-- 2. Tenta di inserire una prenotazione sovrapposta (DEVE FALLIRE)
INSERT INTO bookings (pitch_id, customer_id, booking_period, guests_count, total_price, status)
VALUES (
  (SELECT id FROM pitches WHERE number = '001' LIMIT 1),
  (SELECT id FROM customers LIMIT 1),
  '[2026-02-12 00:00:00, 2026-02-17 00:00:00)', -- overlaps con la prenotazione precedente
  2,
  100.00,
  'confirmed'
);
-- ✅ RISULTATO ATTESO: Errore PostgreSQL con codice 23P01 (exclusion_violation)
-- Messaggio: "conflicting key value violates exclusion constraint prevent_overbooking"
```

**Tramite API:**
- [ ] Apri la dashboard su `http://localhost:3000`
- [ ] Usa il modulo "Cerca Piazzole Disponibili"
- [ ] Inserisci date: 10/02/2026 - 15/02/2026
- [ ] Nota le piazzole disponibili
- [ ] Crea una prenotazione tramite API (vedi sezione "Test API" sotto)
- [ ] Riprova a cercare con le stesse date: la piazzola NON deve più apparire

### Test 2: Verifica Dashboard Stats
- [ ] Verifica che i widget mostrino i dati corretti:
  - **Arrivi Oggi**: numero di prenotazioni con check-in oggi
  - **Partenze Oggi**: numero di prenotazioni con check-out oggi
  - **Occupazione**: percentuale calcolata su 300 piazzole totali

### Test 3: Verifica Calcolo Prezzi Stagionali
**Tramite console browser (F12):**

```javascript
// Testa il calcolo del prezzo
const testPricing = async () => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pitch_id: 'ID_PIAZZOLA', // usa un ID reale dal DB
      customer: {
        full_name: 'Test Cliente',
        phone: '+39 333 1234567',
        email: 'test@example.com'
      },
      check_in: '2026-07-01', // Alta stagione (estate)
      check_out: '2026-07-08',
      guests_count: 4
    })
  });
  const data = await response.json();
  console.log('Prezzo calcolato:', data.booking.total_price);
  // Per una piazzola standard in alta stagione: 35€/notte × 7 notti = 245€
};
```

### Test 4: Verifica Global Search (Ctrl+K)
- [ ] Premi `Cmd+K` (Mac) o `Ctrl+K` (Windows)
- [ ] Verifica che si apra il dialog di ricerca
- [ ] Digita un nome o numero di telefono
- [ ] Verifica che appaia nei risultati (quando l'API customers sarà implementata)

## 🚀 Test API con cURL

### Test Availability Endpoint

```bash
# Cerca piazzole disponibili (tutte)
curl "http://localhost:3000/api/availability?check_in=2026-06-01&check_out=2026-06-05"

# Cerca solo piazzole premium
curl "http://localhost:3000/api/availability?check_in=2026-06-01&check_out=2026-06-05&pitch_type=premium"

# ✅ Risultato atteso: JSON con array di piazzole disponibili
```

### Test Stats Endpoint

```bash
curl "http://localhost:3000/api/stats"

# ✅ Risultato atteso:
# {
#   "arrivals_today": 0,
#   "departures_today": 0,
#   "current_occupancy": 0,
#   "occupancy_percentage": 0
# }
```

### Test Bookings Endpoint

```bash
# Crea prima un cliente di test tramite SQL:
# INSERT INTO customers (full_name, phone, email) 
# VALUES ('Mario Rossi', '+39 333 1234567', 'mario@test.it')
# RETURNING id; -- copia questo ID

# Poi crea una prenotazione:
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "pitch_id": "ID_PIAZZOLA_DAL_DB",
    "customer": {
      "full_name": "Luigi Verdi",
      "phone": "+39 333 9876543",
      "email": "luigi@test.it"
    },
    "check_in": "2026-03-01",
    "check_out": "2026-03-05",
    "guests_count": 3
  }'

# ✅ Risultato atteso: Status 201 con oggetto booking
# ❌ Test anti-overbooking: Riprova con stesse date/piazzola → Status 409 "Piazzola già occupata"
```

## 📊 Popolamento Dati di Test

### Popolare tutte le 300 piazzole
Attualmente lo schema include solo 15 piazzole di esempio. Per inserire tutte le 300:

```sql
-- Script per generare Piazzole (1-100)
DO $$
BEGIN
  FOR i IN 6..100 LOOP
    INSERT INTO pitches (number, type, attributes)
    VALUES (
      LPAD(i::TEXT, 3, '0'),
      'piazzola',
      '{"shade": ' || (RANDOM() > 0.5)::TEXT || ', "electricity": true, "water": false, "size_sqm": 60}'
    );
  END LOOP;
END $$;

-- Tende (101-200)
DO $$
BEGIN
  FOR i IN 106..200 LOOP
    INSERT INTO pitches (number, type, attributes)
    VALUES (
      LPAD(i::TEXT, 3, '0'),
      'tenda',
      '{"shade": ' || (RANDOM() > 0.5)::TEXT || ', "electricity": true, "water": true, "size_sqm": 80}'
    );
  END LOOP;
END $$;

-- Altre Piazzole (201-300)
DO $$
BEGIN
  FOR i IN 206..300 LOOP
    INSERT INTO pitches (number, type, attributes)
    VALUES (
      LPAD(i::TEXT, 3, '0'),
      'piazzola',
      '{"shade": true, "electricity": true, "water": true, "sewer": true, "size_sqm": 100}'
    );
  END LOOP;
END $$;
```

## 🔍 Monitoraggio Prestazioni

### Query lente da monitorare:
- [ ] Apri Supabase → Database → Query Performance
- [ ] Monitora i tempi di esecuzione delle query di availability
- [ ] Obiettivo: < 100ms per la query di disponibilità

### Verifica indici:
```sql
-- Controlla che tutti gli indici siano stati creati
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- ✅ Dovresti vedere:
-- idx_bookings_period (GIST)
-- idx_bookings_pitch_id
-- idx_pitches_type
-- prevent_overbooking (GIST - exclusion constraint)
```

## 📱 Test Responsività (Facoltativo)
- [ ] Testa il dashboard su mobile (Chrome DevTools → Device Mode)
- [ ] Verifica che i componenti siano responsive
- [ ] Controlla che il Cmd+K funzioni anche su dispositivi touch

## ⚠️ Problematiche Note da Testare
1. **Race Conditions**: Testa prenotazioni simultanee sulla stessa piazzola
2. **Timezone**: Verifica che le date siano gestite correttamente nel tuo fuso orario
3. **Validazione Date**: Tenta di creare booking con check_out < check_in (deve fallire)

---

**Data di creazione**: 18/01/2026  
**Ultimo aggiornamento**: -
