# 🦗 Analisi Migrazione CockroachDB per CampFlow

**Data Analisi**: 2026-01-30  
**Database Attuale**: Supabase PostgreSQL  
**Target**: CockroachDB Serverless (5GB Free Tier)

---

## 📊 Stima Capacità Storage (5GB)

### Schema Database Corrente

Il tuo database CampFlow contiene le seguenti tabelle:

| Tabella | Descrizione | Campi Principali |
|---------|-------------|------------------|
| **pitches** | 300 piazzole del campeggio | UUID, number, type, attributes (JSONB) |
| **sectors** | Settori organizzativi | UUID, name |
| **customers** | Anagrafica clienti | UUID, full_name, email, phone, license_plate, group_id |
| **customer_groups** | Gruppi tariffari clienti | UUID, name, description, color |
| **bookings** | Prenotazioni | UUID, pitch_id, customer_id, booking_period (DATERANGE), guests_count, total_price |
| **booking_guests** | Ospiti individuali | UUID, booking_id, dati anagrafici completi, documenti |
| **pricing_seasons** | Stagioni tariffarie | UUID, date ranges, prezzi multipli |
| **group_season_configuration** | Configurazioni sconti gruppo | UUID, discount_percentage, custom_rates (JSONB) |
| **group_bundles** | Pacchetti scontati | UUID, nights, pitch_price, unit_prices (JSONB) |
| **app_logs** | Log di sistema | UUID, level, message, metadata (JSONB) |

---

### 🧮 Calcolo Dimensioni (Stima Realistica)

#### **Dimensioni per Record (Approssimative)**

```
pitches:                     ~300 bytes/record
sectors:                     ~150 bytes/record  
customers:                   ~500 bytes/record
customer_groups:             ~200 bytes/record
bookings:                    ~350 bytes/record
booking_guests:              ~800 bytes/record (dati anagrafici completi)
pricing_seasons:             ~400 bytes/record
group_season_configuration:  ~250 bytes/record
group_bundles:               ~300 bytes/record
app_logs:                    ~400 bytes/record
```

#### **Scenari di Utilizzo con 5GB**

| Scenario | Records Bookings | Records Guests | Records Customers | Totale Occupato | % Utilizzato |
|----------|-----------------|----------------|-------------------|-----------------|--------------|
| **Anno 1 (Basso)** | 5,000 | 15,000 | 2,000 | ~15 MB | 0.3% |
| **Anno 2-3 (Medio)** | 15,000 | 45,000 | 5,000 | ~42 MB | 0.8% |
| **Anno 5 (Alto)** | 30,000 | 90,000 | 10,000 | ~82 MB | 1.6% |
| **Anno 10 (Saturo)** | 60,000 | 180,000 | 20,000 | ~160 MB | 3.2% |
| **Anno 20+ (Massimo)** | 150,000 | 450,000 | 40,000 | ~390 MB | 7.8% |

#### **📈 Risposta alla tua domanda:**

> **Con 5GB puoi archiviare OLTRE 20 ANNI di attività intensa!**

Considerazioni:
- **300 piazzole**: Dimensione fissa (~90 KB)
- **Logs**: Con retention policy (es. 90 giorni) l'impatto è minimo
- **JSONB fields**: Occupano poco spazio se ben utilizzati
- **Indexes**: Aggiungono ~30-40% overhead

**Stima totale realistica per 10 anni**: ~300-500 MB (< 10% del piano gratuito)

---

## ⚠️ Incompatibilità e Modifiche Necessarie

### 🔴 **CRITICHE - Richiedono Modifiche**

#### 1. **EXCLUDE Constraint (Anti-Overbooking)**

**Problema**: CockroachDB **NON supporta** EXCLUDE constraints con GIST

```sql
-- ❌ QUESTO NON FUNZIONA SU COCKROACHDB
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled', 'checked_out'));
```

**Soluzione**: Implementare logica anti-overbooking a livello applicazione o trigger

```sql
-- ✅ SOLUZIONE ALTERNATIVA CON TRIGGER
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE pitch_id = NEW.pitch_id
    AND status NOT IN ('cancelled', 'checked_out')
    AND booking_period && NEW.booking_period
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  ) THEN
    RAISE EXCEPTION 'Booking overlap detected for pitch %', NEW.pitch_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_overbooking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();
```

**Impatto**: 🔴 ALTO - Funzionalità critica, richiede refactoring

---

#### 2. **DATERANGE Type**

**Problema**: CockroachDB supporta `DATERANGE` ma con limitazioni sugli operatori

**Stato**: ⚠️ Supporto parziale - Testare operatori `@>` e `&&`

**Raccomandazione**: 
- Mantenere DATERANGE se gli operatori funzionano
- Alternativa: Usare due colonne `check_in_date DATE` e `check_out_date DATE`

```sql
-- ✅ ALTERNATIVA SICURA
ALTER TABLE bookings 
  ADD COLUMN check_in_date DATE,
  ADD COLUMN check_out_date DATE;

-- Popolare con dati esistenti
UPDATE bookings SET 
  check_in_date = lower(booking_period),
  check_out_date = upper(booking_period);
```

**Impatto**: 🟡 MEDIO - Possibile refactoring query

---

#### 3. **Extension btree_gist**

**Problema**: CockroachDB non supporta estensioni PostgreSQL custom

**Soluzione**: Rimuovere completamente

```sql
-- ❌ DA RIMUOVERE
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;
```

**Impatto**: 🟢 BASSO - Usato solo per EXCLUDE constraint (già da modificare)

---

### 🟡 **MEDIE - Da Verificare**

#### 4. **JSONB Performance**

**Stato**: ✅ CockroachDB supporta JSONB nativamente

**Campi interessati**:
- `pitches.attributes`
- `group_season_configuration.custom_rates`
- `group_bundles.unit_prices`
- `app_logs.metadata`

**Raccomandazione**: Nessuna modifica necessaria

---

#### 5. **GIST Indexes**

**Problema**: Index GIST su `booking_period` probabilmente non supportato

```sql
-- ❌ POTREBBE NON FUNZIONARE
CREATE INDEX idx_bookings_period ON bookings USING GIST (booking_period);
```

**Soluzione**: Usare indici B-tree standard

```sql
-- ✅ ALTERNATIVA
CREATE INDEX idx_bookings_check_in ON bookings (check_in_date);
CREATE INDEX idx_bookings_check_out ON bookings (check_out_date);
```

**Impatto**: 🟡 MEDIO - Performance query potrebbero cambiare leggermente

---

#### 6. **Function Security (`search_path = ''`)**

**Stato**: ⚠️ Da testare

```sql
-- Questa sintassi potrebbe non essere supportata identicamente
SET search_path = '';
```

**Raccomandazione**: Testare tutte le funzioni PL/pgSQL dopo migrazione

---

### 🟢 **BASSE - Nessun Problema**

✅ **Supportati Completamente**:
- UUID generation (`gen_random_uuid()`)
- TIMESTAMPTZ
- DECIMAL types
- JSONB
- CHECK constraints
- Foreign Keys con CASCADE
- Triggers (BEFORE/AFTER)
- PL/pgSQL functions (con alcune limitazioni minori)
- Row Level Security (RLS)
- Unique constraints
- Standard B-tree indexes

---

## 📋 Checklist Migrazione

### Pre-Migrazione
- [ ] Backup completo database Supabase
- [ ] Export dati in formato SQL/CSV
- [ ] Testare query critiche in ambiente CockroachDB di test

### Modifiche Schema
- [ ] Rimuovere EXCLUDE constraint
- [ ] Implementare trigger anti-overbooking
- [ ] Convertire DATERANGE a dual-column (opzionale ma raccomandato)
- [ ] Rimuovere riferimenti a btree_gist
- [ ] Sostituire GIST indexes con B-tree
- [ ] Testare tutte le funzioni PL/pgSQL

### Post-Migrazione
- [ ] Verificare integrità referenziale
- [ ] Testare booking flow (anti-overbooking)
- [ ] Benchmark performance query dashboard
- [ ] Testare applicazione frontend completo
- [ ] Configurare backup automatici

---

## 🎯 Raccomandazione Finale

### ✅ **CockroachDB è FATTIBILE** per il tuo progetto

**Pro**:
- 5GB abbondanti per 20+ anni di dati
- Compatibilità PostgreSQL ~95%
- Distributed database (resilienza)
- Scaling futuro semplice

**Contro**:
- Richiede refactoring anti-overbooking constraint
- Possibile refactoring DATERANGE
- Testing approfondito necessario

### Stima Effort di Migrazione
- **Modifiche Schema**: 4-6 ore
- **Testing & Debug**: 6-8 ore
- **Deployment**: 2-3 ore
- **Totale**: ~2 giorni lavorativi

---

## 🚀 Prossimi Passi

1. **Crea account CockroachDB Serverless** (free tier)
2. **Crea progetto di test** e importa schema modificato
3. **Testa funzionalità critica**: booking overlap prevention
4. **Benchmark performance** vs Supabase
5. **Migrazione definitiva** se i test hanno successo

Vuoi che ti prepari uno schema SQL modificato pronto per CockroachDB?
