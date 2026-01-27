## 📚 Aggiornamento TO_SIMO_DO.md

Sostituisci la sezione "### 2. Configurazione Database" (righe 49-53) con questo contenuto:

```markdown
### 2. Configurazione Database

**Opzione A: Migrations Modulari (Consigliata)** ⭐

- [ ] Apri il tuo progetto Supabase
- [ ] Vai su **SQL Editor** nel menu laterale
- [ ] Esegui i file nella cartella `supabase/migrations/` **in ordine sequenziale**:
  1. `01_extensions.sql` - Estensioni PostgreSQL (uuid-ossp, btree_gist)
  2. `02_tables.sql` - Tabelle e constraint anti-overbooking  
  3. `03_indexes.sql` - Indici performance (GIST + B-tree)
  4. `04_triggers.sql` - Trigger timestamp automatici
  5. `05_functions.sql` - Funzioni statistiche dashboard
  6. `06_seed_data.sql` - Dati iniziali (15 piazzole sample)
  7. `07_rls.sql` - Row Level Security (opzionale, attualmente vuoto)
- [ ] **Leggi** il file `supabase/migrations/README.md` per:
  - Istruzioni dettagliate di esecuzione
  - Query di verifica post-installazione
  - Troubleshooting comuni
  - Script per generare 300 piazzole in produzione

**Opzione B: File Consolidato**

- [ ] Apri l'SQL Editor nel pannello Supabase
- [ ] Copia e incolla il contenuto del file `supabase/schema.sql` (file completo)
- [ ] Esegui lo script SQL

**Verifiche comuni**:
- [ ] Verifica tabelle create: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
- [ ] Verifica constraint anti-overbooking: `SELECT conname FROM pg_constraint WHERE conrelid = 'bookings'::regclass AND conname = 'prevent_overbooking';`
- [ ] Verifica funzioni: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
- [ ] Test anti-overbooking: Vedi sezione "Test 1" più sotto o `supabase/migrations/README.md`
```

Aggiungi anche questa nuova sezione dopo "### 4. Installazione e Avvio":

```markdown
### 5. Generazione Piazzole Complete (Produzione)

Se hai eseguito le migrations e  vuoi generare tutte le 300 piazzole (invece delle 15 di test), esegui questo script SQL:

```sql
DO $$
DECLARE
  i INTEGER;
BEGIN
  -- Piazzole 1-100
  FOR i  IN 1..100 LOOP
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
SELECT type, COUNT(*) FROM pitches GROUP BY type;
\`\`\`

> **Nota**: Questo script è già documentato in `supabase/migrations/06_seed_data.sql` e `supabase/migrations/README.md`
```
