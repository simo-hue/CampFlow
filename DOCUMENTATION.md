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
- **Automatic**: Connect your GitHub repository to Vercel (https://vercel.com/new).
- **Environment Variables**: You MUST add the following environment variables in the Vercel Project Settings (Settings > Environment Variables):
    - `NEXT_PUBLIC_SUPABASE_URL`: Found in Supabase > Settings > API > Project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Supabase > Settings > API > Project API Keys (anon public).
    - `SUPABASE_SERVICE_ROLE_KEY`: Found in Supabase > Settings > API > Project API Keys (service_role secret). **Critical for server actions.**
    - `ADMIN_USERNAME`: Choose a secure username for the System Monitor (e.g., `admin`).
    - `ADMIN_PASSWORD`: Choose a secure password for the System Monitor.
- **Build Command**: Default (`next build`).
- **Output Directory**: Default (`.next`).
- **Networking**: If using Supabase, ensure "Allow all IP addresses" is enabled in Supabase Database settings, or whitelist Vercel's IP ranges (not recommended due to dynamic IPs). generally Supabase allows connections by default.

# Weekly Occupancy Optimization (2026-01-20)

## Overview
Optimized the "Panoramica Settimanale" widget to fix slow loading times.

## Changes
- **Client-Side**: `WeeklyOccupancyWidget` now fetches ONLY the 7 required days of data instead of the full booking history.
- **Mechanism**: Utilizes Supabase `.overlaps()` filter for efficient database-level filtering without needing complex backend changes.
- **Performance**: Reduced data transfer size by ~95% and eliminated client-side processing lag.
- **Caching (Memory)**: Implemented 5-minute local cache to prevent re-fetching on navigation.
- **Caching (Storage)**: Implemented `localStorage` persistence. The widget now loads *immediately* (0ms perceived latency) if the user has visited the dashboard earlier in the day.

## Optional Database Optimization
A prepared migration `supabase/migrations/20260120140000_get_weekly_occupancy.sql` is available.
If enabled, it moves the calculation entirely to the database (RPC), which is slightly faster but currently not strictly necessary given the client-side optimization success.

# Check-in Validation (2026-01-20)
## Overview
Strict validation has been enforced on the Check-in form to ensure data integrity and compliance with requirements (especially for Alloggiati Web).

## Validated Fields
The system now prevents check-in if ANY of the following fields are empty:
- **Anagrafica**: Name, Surname, Birth Date, Gender, Birth Place (Country/Province/City), Citizenship.
- **Residenza**: Address, Residence Place (Country/Province/City/ZIP).
- **Document**: Type, Number, Issue Date, Issuer, Issue Place (City/Country).

## Implementation
- **Client-Side**: `validateForm()` helper in `CheckInPage` checks all fields before allowing the API call.
- **Visual Feedback**: Invalid fields are highlighted with a **red border** to immediately attract the user's attention.
- **Toast Feedback**: A clear error message lists specifically which fields are missing.

# System Monitor Security Update (2026-01-20)

## Overview
Improved the security posture of the System Monitor (`/sys-monitor`) by decoupling its authentication from the main application and enforcing strict access controls on sensitive server actions.

## Changes
- **Authentication Decoupling**: Logging into the main application (`/login`) NO LONGER automatically grants access to `/sys-monitor`.
    - **Why**: Keeps the "God Mode" developer dashboard isolated from standard operational workflows.
    - **Effect**: You must log in specifically at `/sys-monitor/login` with admin credentials to access the monitor.
- **Middleware Update**: The global middleware now explicitly whitelists `/sys-monitor` based on its own internal authentication logic, preventing loop redirects and allowing independent access.
- **Server Action Security**: All sensitive actions (cleaning logs, clearing databases) now perform a rigorous server-side check of the `sys_monitor_auth` cookie before execution. This prevents "Unauthorized" execution even if someone bypasses the client-side UI.

## Verification
- Accessing `/sys-monitor` without being logged into the **monitor itself** will now correctly redirect to the monitor login page, even if you are logged into the main app.

# Pricing Variables Update (2026-01-21)

## Overview
Added support for new persistent pricing variables to the Settings and Booking flow.

## New Variables
- **Car Price** (€/day): Cost for an additional car.
- **Child Price** (€/day): Cost for children.
- **Child Max Age**: The maximum age (inclusive) for a guest to be considered a child.

## Implementation
- **Settings**: New fields in `Settings > Prices` saved to `localStorage`.
- **Booking Popup**: 
    - Renamed "Ospiti" to "Adulti".
    - Added "Bambini" input with info tooltip showing the configured max age.
    - Added "Auto" input.
- **Calculation**: Returns total price including extra costs for children and cars.

# Overbooking Protection (2026-01-21)

## Overview
The system implements a robust double-layer protection against overbooking to ensure data integrity.

## Layers of Protection
1.  **Database Constraint (Primary)**:
    -   **Mechanism**: A PostgreSQL Exclusion Constraint (`prevent_overbooking`) is active on the `bookings` table.
    -   **Logic**: It physically prevents two rows from having overlapping `booking_period` ranges for the same `pitch_id`.
    -   **Error Code**: If a violation occurs, Postgres returns error code `23P01`.

2.  **API Error Handling**:
    -   **Endpoint**: `/api/bookings` catches the `23P01` error.
    -   **Response**: Returns a `409 Conflict` status with a clearer message: "Piazzola già occupata in questo periodo".

3.  **User Feedback**:

# Customer Details Optimization (2026-01-21)

## Overview
Fixed an issue where "Anagrafica", "Prenotazioni", and "Statistiche" tabs were empty in the Customer Details page (`/customers/[id]`).

## Fixes Implemented
- **API**: Resolved a silent failure in `GET /api/customers/[id]` caused by querying non-existent columns (`booking_guests(count)`, `pitch(name)`).
- **Frontend**: 
    - Implemented **Intelligent Caching** (staleTime 5 min) prevents unnecessary re-fetches.
    - Improved **Date Parsing** robustness for booking periods.
    - Optimized data structure handling.

### UI Refinement (2026-01-21)
- **Aesthetics**: Improved readability of the customer details page by increasing contrast.
- **Components**: Updated inputs and cards to have distinct backgrounds, solving the "Total Black" visibility issue.

# Smart Date Picker (2026-01-21)

## Overview
Improved UX for the "Search Available Pitches" box on the dashboard.

## Change
- **Behavior**: When opening the "Departure Date" calendar, it now defaults to the month of the selected "Arrival Date" (if set), rather than the current month.
- **Component**: `AvailabilityModule.tsx`
- **Benefit**: Reduces scrolling when booking dates in the future.

# Calendar UI Stabilization (2026-01-21)

## Overview
Stabilized the height of the calendar date picker to prevent layout shifts.

## Change
- **Behavior**: The `Calendar` component now enforces a fixed display of **6 weeks** for every month.
- **Component**: `src/components/ui/calendar.tsx`
- **Benefit**: Prevents the calendar popover from "jumping" or resizing when navigating between months with different numbers of weeks (e.g., February vs. August).

# Occupancy Page Fixes (2026-01-21)

## Overview
Fixed visual layout issues and logic inconsistencies on the `/occupancy` page.

## Changes
1.  **Column Width Fixed (Responsive)**: Switched to `table-fixed` CSS layout. This guarantees that all date columns (after the first pitch column) are mathematically identical in width. Added `min-w-[40px]` to maintain readability on small screens.
2.  **Booking Logic Correction (Safe)**: Fixed an off-by-one error in drag-and-drop booking creation.
    -   **Checkout Logic**: Selecting day X to Y now results in a booking with checkout on Y+1.
    -   **Validation Fix**: Updated `checkOverlap` to be **inclusive** of the end date. This prevents the "API 409 Conflict" error by blocking invalid selections (which would overlap due to the +1 logic) directly in the UI.

# Check-out Functionality (2026-01-23)

## Overview
Implemented complete check-out functionality on the `/departures` page, allowing staff to process guest departures with automatic pitch liberation.

## User Flow
1. Navigate to `/departures` page
2. Click the "Check-out" button on a departure card
3. Review confirmation dialog showing:
   - Guest name and number of guests
   - Pitch number
   - Booking period
4. Click "Conferma Check-out" to process
5. Success toast notification appears
6. Card is removed from the list automatically

## Implementation Details

### Database Changes
- **Migration**: `20260123_update_checkout_constraint.sql`
- **Constraint Update**: Modified `prevent_overbooking` exclusion constraint to exclude both `cancelled` AND `checked_out` statuses
- **Result**: Pitches are automatically freed when a booking status changes to `checked_out`
- **Customer Data**: Customers remain in the database permanently for historical tracking and statistics

### Frontend Components
1. **CheckOutDialog** (`src/components/shared/CheckOutDialog.tsx`):
   - Confirmation modal with booking details
   - API integration to update booking status
   - Loading state management
   - Success/error toast notifications

2. **GuestCard** (`src/components/shared/GuestCard.tsx`):
   - Added `onRefresh` optional callback prop
   - Click handler for check-out button
   - State management for dialog visibility
   - Conditional rendering of CheckOutDialog for departures

3. **Departures Page** (`src/app/departures/page.tsx`):
   - Passes `loadDepartures` callback to GuestCard components
   - Automatic list refresh after successful check-out

### API Usage
- **Endpoint**: `PATCH /api/bookings/[id]`
- **Payload**: `{ status: 'checked_out' }`
- **Response**: Updated booking object

## Benefits
- **Instant Pitch Liberation**: No manual intervention needed to free pitches
- **Data Integrity**: Database constraint prevents accidental overbooking
- **Historical Records**: Complete booking history preserved
- **Customer Retention**: Customer data maintained for analytics and future bookings
- **User Experience**: Simple, clear confirmation flow with immediate feedback
# Dynamic Sectors & Settings Configuration (2026-01-25)

## Overview
Implemented a dynamic system for managing campsite sectors and global configuration settings, replacing hardcoded constants.

## Dynamic Sectors
### Database Changes
- **Table**: `sectors`
- **Fields**: `id`, `name`, `created_at`, `updated_at`.
- **Migration**: `20260125171000_create_sectors_table.sql`

### Features
- **CRUD Operations**: Complete management (Create, Read, Update, Delete) of sectors via the Settings page.
- **Pitch Association**: Pitches are linked to sectors via `sector_id`.
- **Validation**: Prevents deletion of sectors that still contain pitches (UI warning/logic).
- **UI**: New "Configurazione Settori" section in `SettingsPage`.
- **UX Improvement**: Implemented a Tabbed interface in `SettingsPage` to switch views between "Piazzole" and "Settori", eliminating excessive vertical scrolling.

## Global Settings
### Pricing Configuration
- **Persistence**: Pricing settings are stored in `localStorage` for now (to be migrated to DB in future).
- **Configurable Items**:
    - Person Price
    - Dog Price
    - Car Price
    - Child Price
    - Child Max Age

### Visual Settings
- **Dark Mode**: Toggle available in "Aspetto" section.

## Confirmations
- **Safety**: Critical actions (Delete Sector, Delete/Split/Merge Pitch) now require explicit confirmation via a custom `ConfirmationDialog` UI, replacing browser alerts.

# Recharts Build Warning Fix (2026-01-25)

## Problem
During Vercel Deployment (or `npm run build`), warnings appeared: `The width(-1) and height(-1) of chart should be greater than 0`.
This was caused by **Recharts** trying to measure container dimensions during **Static Site Generation (SSG)** for the Landing Pages (`/w/*`), where the DOM and layout are not fully available (headless environment).

## Solution
Implemented a `mounted` state check in the Demo components causing the issue:
- `src/components/website/demos/DemoHeroDashboard.tsx`
- `src/components/website/demos/DemoStatsWidget.tsx`

The charts now only render **after** the component has mounted on the client (`useEffect` -> `setMounted(true)`), ensuring the DOM and dimensions are present. This silences the build warnings while preserving functionality for the user.

# Login Page Refinement (2026-01-25)

## Overview
Modified the layout to exclude the main Application Header from the Login Page (`/login`).

## Changes
- **Component**: `src/components/layout/Header.tsx`
- **Logic**: Added a check `if (pathname === '/login') return null;`.
- **Result**: The login page now displays only the authentication box centered on the screen, without the navigation bar meant for authenticated users.
