# Logging & System Monitor

## Overview
The application uses a custom "Universal Logger" that:
1.  **Development**: Prints pretty logs to the console.
2.  **Production**: Prints JSON to the console (for Vercel) AND saves `ERROR`/`WARN` logs to the Supabase `app_logs` table.

## Developer Dashboard (`/sys-monitor`)
A hidden, password-protected dashboard is available at `/sys-monitor`.
- **System Health**: Checks database latency and environment variable configuration.
- **Persistent Logs**: Displays the last 50 error/warning logs from the database.

## Usage

### Logging in Code
Do not use `console.log` directly. Import the logger:

```typescript
import { logger } from '@/lib/logger';

// Info (Console only in Prod)
logger.info('User updated profile', { userId: '123' });

// Error (Persisted to DB in Prod)
logger.error('Failed to process payment', { error: err.message, amount: 50 });
```

### Setup Requirements
1.  **Database**: Run the `20260120104000_create_logs_table.sql` migration.
2.  **Environment Variables**:
    - `ADMIN_USERNAME`: Username for the dashboard.
    - `ADMIN_PASSWORD`: Password for the dashboard.
    - `SUPABASE_SERVICE_ROLE_KEY`: Required for the server to write logs safely.

# Dashboard Optimization

## Overview
The dashboard statistics (Arrivals, Departures, Occupancy) are calculated using a unified RPC function `get_dashboard_stats` to improve performance and consistency.

## Database Function
- **Function**: `get_dashboard_stats(target_date)`
- **Returns**: `arrivals_today`, `departures_today`, `current_occupancy`, `total_pitches`
- **Logic**:
    - **Occupancy**: Checks `booking_period @> target_date`.
    - **Arrivals/Departures**: separate counts.
    - **Performance**: Executed as a single query.

## Implementation Details
- **Frontend**: `QuickStatsWidget.tsx` polls `/api/stats` every 30s.
- **Backend**: `/api/stats/route.ts` calls the RPC function.
- **Migration**: `20260120113000_optimize_dashboard_stats.sql`

## Statistics Calculation
### Revenue & Trend
- **Revenue**: Calculated on an **Accrual Basis** (daily competence). Each booking's total price is divided by its duration, and the daily value is summed for each day within the selected range.
- **Trend**: Compares the total revenue of the current selected period (e.g., last 30 days) with the **previous equivalent period** (e.g., the 30 days prior).
  - Formula: `((CurrentRevenue - PreviousRevenue) / PreviousRevenue) * 100`

# System Reset (Danger Zone)

## Overview
A "System Reset" feature is available in the Developer Dashboard (`/sys-monitor`).
This feature performs a "Factory Reset" of the application database.


## Database Management
The `/sys-monitor` page now features a comprehensive **Database Management** widget.

### Transactional Data
- **Clear Bookings** (Yellow): Delete bookings & guests. Keeps customers.
- **Clear Customers** (Blue): Delete customers (cascades to bookings).
- **Clear Logs**: Delete system logs.

### Configuration
- **Clear Pitches** (Orange): Delete all pitch definitions.
- **Clear Seasons** (Orange): Delete all season definitions.

### Maintenance
- **Seed Pitches** (Green): Restore default pitches (001-205) if table is empty.
- **Seed Seasons** (Green): Restore default pricing seasons if table is empty.

### Danger Zone
- **Factory Reset** (Red): Wipes everything and restores default configuration.

## Security
- Protected by Admin Authentication (same as the dashboard).
- Requires an explicit text confirmation ("RESET") in the UI to prevent accidental clicks.

# Test Data Seeding

## Overview
To facilitate testing, a migration script has been created to populate the database with realistic test data.

## Migration Details
- **File**: `20260120130000_seed_test_bookings.sql`
- **Customers**: Generates 50 random customers with realistic Italian names and details.
- **Bookings**: Generates ~300 bookings distributed over the last 3 months and the next 1 month.
- **Logic**:
    - Randomly assigns pitches (tents or standard pitches).
    - Status is automatically calculated based on the date range (`checked_out` for past, `confirmed` for future, `checked_in` for current).
    - Checks for overlapping bookings to ensure data integrity (skips if overlap occurs).

# UI/UX Improvements

## Header Alignment
- **Date**: 2026-01-20
- **Change**: The "CampFlow" logo in the `Header` component has been aligned to the far left of the view port.
- **Implementation**: Replaced the `container mx-auto` class constraint with `w-full` in `src/components/layout/Header.tsx` to utilize the full width of the screen.

## Occupancy Matrix Enhancements
- **Color Coding**: Implemented deterministic color assignment for reservations based on Booking ID.
- **Merged Cells**: Unified consecutive days of the same reservation into a single visual block using `colSpan`.
- **Visuals**: Implemented a "Total Black" high-contrast theme for headers and a transparent gray (`bg-muted/20`) for the body.
- **Component**: `SectorOccupancyViewer.tsx`
## 📚 Aggiornamento DOCUMENTATION.md

Aggiungi questa nuova sezione dopo la sezione "Anti-Overbooking" (dopo la riga 99):

```markdown
---

### 3.5. Organizzazione Migrations SQL

**Decisione**: Strutturare i file SQL in modo modulare nella cartella `supabase/migrations/`.

**Struttura creata**:
\`\`\`
supabase/
├── schema.sql (riferimento completo)
└── migrations/
    ├── README.md (guida esecuzione)
    ├── 01_extensions.sql
    ├── 02_tables.sql
    ├── 03_indexes.sql
    ├── 04_triggers.sql
    ├── 05_functions.sql
    ├── 06_seed_data.sql
    └── 07_rls.sql (placeholder per Fase 2)
\`\`\`

**Motivazioni**:
- **Manutenibilità**: Ogni file ha una responsabilità specifica
- **Esecuzione incrementale**: È possibile eseguire solo le parti necessarie
- **Idempotenza**: Tutti i file usano pattern safe (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- **Documentazione inline**: Ogni file è auto-documentato con commenti estesi
- **Staging controllato**: Si può testare ogni migration prima di eseguire la successiva

**File dettagliati**:
1. **01_extensions.sql**: uuid-ossp e btree_gist per GIST indexes
2. **02_tables.sql**: Tutte le tabelle + constraint anti-overbooking
3. **03_indexes.sql**: 10+ indici per performance (GIST + B-tree)
4. **04_triggers.sql**: Trigger automatici per aggiornamento `updated_at`
5. **05_functions.sql**: Funzioni SQL per statistiche dashboard
6. **06_seed_data.sql**: Dati iniziali (15 piazzole sample)
7. **07_rls.sql**: Placeholder per Row Level Security (Fase 2)

**Vantaggi operativi**:
- **Setup pulito**: Nuovi sviluppatori possono eseguire migrations in ordine sequenziale
- **Troubleshooting**: Se un file fallisce, è chiaro quale componente ha problemi
- **Rollback selettivo**: Possibile fare down migration per singoli moduli
- **Versioning**: Facile tracciare aggiunte con nuovi file `08_*.sql`, `09_*.sql`

**Alternativa considerata**: Un singolo file schema.sql monolitico
- ✅ Più semplice per esecuzione one-shot
- ❌ Difficile da debuggare se ci sono errori
- ❌ Tutto-o-niente (no incrementalità)
- ❌ Modifiche future richiedono alterazione file complesso

---
```

E aggiungi questa voce al Changelog alla fine del documento:

```markdown
### 2026-01-18 - Organizzazione SQL Migrations
- ✅ Creata struttura modulare nella cartella `supabase/migrations/`
- ✅ 7 file SQL separati per responsabilità (extensions, tables, indexes, triggers, functions, seed, rls)
- ✅ README completo con istruzioni esecuzione e query di verifica
- ✅ Tutti i file sono idempotenti e con documentazione inline estesa
- **Motivazione**: Facilita manutenzione, troubleshooting e deployment incrementale del database
```

# Deployment

## Vercel Deployment (Recommended)
- **Automatic**: Connect your GitHub repository to Vercel.
- **Environment Variables**: Remember to add the necessary environment variables in the Vercel Project Settings:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `ADMIN_USERNAME`
    - `ADMIN_PASSWORD`
- **Build Command**: Default (`next build`)
- **Output Directory**: Default (`.next`)
