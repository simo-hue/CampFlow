# Supabase Migrations - CampFlow PMS

Questa cartella contiene le migration SQL per il database CampFlow, organizzate in modo modulare per facilitare la manutenzione e l'esecuzione.

## 📋 File Migrations

| File | Descrizione | Ordine |
|------|-------------|---------|
| `01_extensions.sql` | Estensioni PostgreSQL (uuid-ossp, btree_gist) | 1° |
| `02_tables.sql` | Definizione tabelle e constraint anti-overbooking | 2° |
| `03_indexes.sql` | Indici per performance (GIST + B-tree) | 3° |
| `04_triggers.sql` | Trigger automatici per timestamp | 4° |
| `05_functions.sql` | Funzioni SQL per statistiche dashboard | 5° |
| `06_seed_data.sql` | Dati iniziali per testing (15 piazzole sample) | 6° |
| `07_rls.sql` | Row Level Security (placeholder per Fase 2) | 7° |

## 🚀 Esecuzione Migrations su Supabase

### Opzione 1: Esecuzione Completa (Consigliata per primo setup)

1. Apri il tuo progetto su [Supabase Dashboard](https://app.supabase.com)
2. Vai su **SQL Editor** nel menu laterale
3. Crea una nuova query
4. Esegui i file **in ordine sequenziale** copiando e incollando il contenuto:

```sql
-- 1. Extensions
-- Copia/incolla il contenuto di 01_extensions.sql e clicca "Run"

-- 2. Tables
-- Copia/incolla il contenuto di 02_tables.sql e clicca "Run"

-- 3. Indexes
-- Copia/incolla il contenuto di 03_indexes.sql e clicca "Run"

-- 4. Triggers
-- Copia/incolla il contenuto di 04_triggers.sql e clicca "Run"

-- 5. Functions
-- Copia/incolla il contenuto di 05_functions.sql e clicca "Run"

-- 6. Seed Data
-- Copia/incolla il contenuto di 06_seed_data.sql e clicca "Run"

-- 7. RLS (opzionale, attualmente vuoto)
-- Copia/incolla il contenuto di 07_rls.sql e clicca "Run"
```

### Opzione 2: File Singolo Consolidato

Se preferisci, puoi usare il file `../schema.sql` che contiene tutto il contenuto consolidato in un unico file.

> **⚠️ Attenzione**: Se hai già eseguito le migrations modulari, NON eseguire di nuovo schema.sql per evitare conflitti.

## ✅ Verifiche Post-Esecuzione

Dopo aver eseguito le migrations, verifica che tutto sia stato creato correttamente:

### 1. Verifica Tabelle
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Dovresti vedere: `booking_guests`, `bookings`, `customers`, `pitches`

### 2. Verifica Constraint Anti-Overbooking
```sql
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'bookings'::regclass
AND conname = 'prevent_overbooking';
```

Dovresti vedere il constraint `prevent_overbooking` di tipo `x` (exclusion)

### 3. Verifica Indici
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY indexname;
```

Dovresti vedere almeno 10 indici (idx_bookings_*, idx_pitches_*, idx_customers_*, etc.)

### 4. Verifica Funzioni
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

Dovresti vedere: `count_arrivals_today`, `count_departures_today`, `get_current_occupancy`, `update_updated_at_column`

### 5. Verifica Dati Seed
```sql
SELECT COUNT(*) as total_pitches, 
       COUNT(*) FILTER (WHERE type = 'piazzola') as piazzole,
       COUNT(*) FILTER (WHERE type = 'tenda') as tende
FROM pitches;
```

Dovresti vedere: 15 piazzole totali (10 piazzola, 5 tenda)

## 🧪 Test Anti-Overbooking

Testa il constraint anti-overbooking con questo script:

```sql
-- 1. Crea un cliente test
INSERT INTO customers (full_name, phone) 
VALUES ('Test User', '+39123456789')
RETURNING id;
-- Salva l'ID restituito

-- 2. Crea una prenotazione
INSERT INTO bookings (pitch_id, customer_id, booking_period, guests_count, total_price, status)
SELECT 
  (SELECT id FROM pitches LIMIT 1),
  '<CUSTOMER_ID_QUI>',
  '[2026-06-01, 2026-06-05)',
  2,
  100.00,
  'confirmed';

-- 3. Prova a creare una prenotazione sovrapposta (DEVE FALLIRE)
INSERT INTO bookings (pitch_id, customer_id, booking_period, guests_count, total_price, status)
SELECT 
  (SELECT id FROM pitches LIMIT 1),
  '<CUSTOMER_ID_QUI>',
  '[2026-06-03, 2026-06-07)', -- Sovrapposizione!
  2,
  100.00,
  'confirmed';
-- Expected: ERROR 23P01: conflicting key value violates exclusion constraint "prevent_overbooking"
```

Se ricevi l'errore `23P01`, il sistema anti-overbooking funziona correttamente! ✅

## 📊 Generazione 300 Piazzole (Produzione)

Per produzione, devi generare tutte le 300 piazzole. Esegui questo script dopo aver completato le migrations:

```sql
DO $$
DECLARE
  i INTEGER;
BEGIN
  -- Piazzole 1-100
  FOR i IN 1..100 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;
  
  -- Tende 101-200
  FOR i IN 101..200 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'tenda', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;
  
  -- Altre Piazzole 201-300
  FOR i IN 201..300 LOOP
    INSERT INTO pitches (number, suffix, type, attributes)
    VALUES (LPAD(i::TEXT, 3, '0'), '', 'piazzola', '{}')
    ON CONFLICT (number, suffix) DO NOTHING;
  END LOOP;
END $$;

-- Verifica
SELECT COUNT(*) FROM pitches; -- Deve restituire 300
```

## 🔄 Idempotenza

Tutti i file SQL sono idempotenti, il che significa che puoi eseguirli più volte senza causare errori:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `CREATE OR REPLACE FUNCTION`
- `INSERT ... ON CONFLICT DO NOTHING`

## 🛠️ Troubleshooting

### Errore: "extension already exists"
✅ Normale! Il comando `CREATE EXTENSION IF NOT EXISTS` è idempotente.

### Errore: "relation already exists"
✅ Normale se hai già eseguito le migrations. Puoi ignorare.

### Errore: "constraint already exists"
⚠️ Verifica di non aver eseguito lo stesso file due volte. Il file `02_tables.sql` usa un blocco `DO $$` per evitare questo errore.

### Errore di connessione all'app Next.js
🔍 Verifica che le variabili ambiente in `.env.local` siano corrette:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Le statistiche dashboard non funzionano
1. Verifica che le funzioni siano state create: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
2. Testa manualmente: `SELECT count_arrivals_today(CURRENT_DATE);`

## 📚 Documentazione Aggiuntiva

- **Schema completo**: Vedi `../schema.sql` per il file consolidato con commenti estesi
- **Documentazione progetto**: Vedi `../../DOCUMENTATION.md` per scelte architetturali
- **Checklist setup**: Vedi `../../TO_SIMO_DO.md` per istruzioni complete setup progetto

## 🔐 Sicurezza (Fase 1)

⚠️ **Attenzione**: Attualmente il progetto NON ha autenticazione implementata.
- Le API routes usano il `service role key`
- Non ci sono policy RLS attive
- Adatto SOLO per uso interno (reception staff)

Per implementazione autenticazione → Vedi `07_rls.sql` per piano Fase 2

## 🎯 Performance Targets

Con tutte le migrations eseguite, queste sono le performance attese:

| Query | Target | Garantito da |
|-------|--------|--------------|
| Availability search | < 100ms | GIST index su booking_period |
| Dashboard stats | < 200ms | Composite index su date + functions |
| Booking creation | < 200ms | Atomic transaction + GIST check |

## 📅 Manutenzione

### Aggiungere nuove migrations
1. Crea `08_nome_feature.sql` nella cartella migrations/
2. Aggiorna il file `../schema.sql` completo
3. Documenta in `../../DOCUMENTATION.md`
4. Aggiungi test in `../../TO_SIMO_DO.md`

### Reset completo database (solo sviluppo!)
```sql
-- ⚠️ ATTENZIONE: Cancella TUTTI i dati!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Poi ri-esegui tutte le migrations in ordine
```

---

**Creato**: 18 Gennaio 2026  
**Database**: PostgreSQL 15+ (Supabase)  
**Versione**: 1.0.0
