# Azioni Manuali Richieste - CampFlow PMS

## 🔴 AZIONE URGENTE: Migrazione Database Pricing Stagionale

### 1. Eseguire Migrazione SQL
**File**: `supabase/migrations/09_pricing_seasons.sql`

**Comando**:
```bash
psql $DATABASE_URL -f supabase/migrations/09_pricing_seasons.sql
```

**Oppure tramite Supabase Dashboard**:
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto CampFlow
3. SQL Editor → New Query
4. Copia e incolla il contenuto di `09_pricing_seasons.sql`
5. Esegui (Run)

**Cosa fa questa migrazione**:
- ✅ Crea tabella `pricing_seasons`
- ✅ Aggiunge indici per performance
- ✅ Crea funzione helper `get_price_for_date()`
- ✅ Inserisce dati di esempio (stagioni italiane 2026)

### 2. Verificare Migrazione

Dopo aver eseguito la migrazione, verifica che tutto sia OK:

```sql
-- Controlla che la tabella sia stata creata
\d pricing_seasons

-- Verifica dati seed
SELECT name, start_date, end_date, piazzola_price_per_day, priority 
FROM pricing_seasons 
ORDER BY start_date;

-- Test funzione per data specifica
SELECT get_price_for_date('2026-08-15', 'piazzola'); 
-- Dovrebbe restituire 50.00 (Ferragosto, priorità alta)
```

**Output atteso**:
```
 name                 | start_date | end_date   | piazzola_price | priority
----------------------+------------+------------+----------------+----------
 Bassa Stagione       | 2026-01-01 | 2026-04-30 |          20.00 |        0
 Media Stagione       | 2026-05-01 | 2026-05-31 |          30.00 |        5
 Alta Stagione        | 2026-06-01 | 2026-08-31 |          40.00 |       10
 Ferragosto           | 2026-08-10 | 2026-08-20 |          50.00 |       20
 Media Stagione       | 2026-09-01 | 2026-09-30 |          30.00 |        5
 Bassa Stagione       | 2026-10-01 | 2026-12-31 |          20.00 |        0
 Natale               | 2026-12-20 | 2027-01-06 |          35.00 |       15
```

---

## ✅ Implementato (Non serve azione)

### UI Updates
- ✅ Seasonal Pricing: Semplificato selettore colori (3 preset + custom)


Le seguenti modifiche sono già state applicate al codice:

### Fix Build
- ✅ Fix: Import `supabaseAdmin` corretto in `/api/pricing/seasons`

### TypeScript Types
- ✅ Aggiunti `PricingSeason`, `PriceBreakdownDay`, `PriceCalculation` in `/src/lib/types.ts`

### API Endpoints
- ✅ `/api/pricing/seasons` - CRUD completo per gestione stagioni
- ✅ `/api/pricing/calculate` - Calcolo prezzi con breakdown giornaliero

### Booking Modal
- ✅ `BookingCreationModal.tsx` aggiornato per usare API calcolo prezzi
- ✅ Calcolo asincrono con loading state
- ✅ Gestione errori con fallback

### Error Handling
- ✅ Toast notifications per tutti gli errori
- ✅ Fallback pricing se API non disponibile

---

## 📋 Prossime Azioni (Opzionali - Da Fare Dopo)

### 1. UI Gestione Stagioni (Da Implementare)
Creare componente nelle impostazioni per:
- Visualizzare tutte le stagioni
- Aggiungere nuove stagioni
- Modificare stagioni esistenti
- Eliminare (disattivare) stagioni

**File da creare**: `/src/components/settings/SeasonalPricingManager.tsx`

### 2. Visualizzare Dettaglio Prezzo Nel Modal
Opzionale: Mostrare breakdown giornaliero nel modal prenotazione:
- Ogni giorno con il suo prezzo
- Nome stagione applicata
- Colore per identificazione visiva

### 3. Rollover Annuale
Sistema automatico per copiare configurazione stagioni anno precedente al nuovo anno.

---

## 🔍 Test Consigliati

Dopo la migrazione, testa:

1. **Calcolo prezzi**:
   - Vai su `/occupancy`
   - Seleziona un periodo in alta stagione (es. 10-15 Agosto)
   - Verifica che il prezzo sia €250 (5 giorni × €50 Ferragosto)

2. **API diretta**:
   ```bash
   curl "http://localhost:3000/api/pricing/calculate?checkIn=2026-08-10&checkOut=2026-08-15&pitchType=piazzola"
   ```
   Dovrebbe restituire `{"totalPrice": 250, "days": 5, ...}`

3. **Sovrapposizioni**:
   - Nota che dall'1 al 31 Agosto c'è "Alta Stagione" (€40)
   - Ma dal 10 al 20 c'è "Ferragosto" (€50, priorità più alta)
   - Verifica che il 15 Agosto usi €50 e non €40

---

## ⚠️ Note Importanti

### Immutabilità Prezzi Prenotazioni
- ✅ Il prezzo viene salvato in `bookings.total_price` al momento della creazione
- ✅ Se modifichi le tariffe stagionali, le prenotazioni esistenti NON cambiano
- ✅ Questo garantisce coerenza per statistiche e storico

### Sistema Priorità
- Priorità più alta = vince in caso di sovrapposizione
- Esempio: Ferragosto (priorità 20) batte Alta Stagione (priorità 10)
- Se stessa priorità: vince la stagione creata per ultima

### Fallback
- Se nessuna stagione copre una data: tariffa standard €25 piazzola / €18 tenda
- Gestito automaticamente dall'API

---

## 📞 Supporto

In caso di problemi:
1. Controlla i log del terminale per errori API
2. Verifica che la migrazione sia stata eseguita
3. Controlla che Supabase sia raggiungibile

**File coinvolti**:
- `/supabase/migrations/09_pricing_seasons.sql`
- `/src/app/api/pricing/seasons/route.ts`
- `/src/app/api/pricing/calculate/route.ts`
- `/src/components/dashboard/BookingCreationModal.tsx`
- `/src/lib/types.ts`
