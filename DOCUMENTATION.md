# Project Documentation

## [2026-04-24 19:50]: Global Name Display Standardization
*Details*: Standardized the customer name display format to "Cognome Nome" (Last Name First Name) across the entire application. This change ensures a more professional and sorted view in lists and reports.
*Tech Notes*:
- Modified string interpolations in `GuestCard`, `CheckOutDialog`, `Customers` page, `BookingDetailsDialog`, `GuestForm`, `CheckIn` page, and `CustomerDetailPage`.
- Updated API responses in `api/bookings/[id]/guests`, `api/occupancy`, and `api/occupancy/batch` to use the new naming convention.
- Swapped initials in Avatar displays (e.g., "LC" for "Lastname Customer").
- Build verified with `npm run build`.

## [2026-04-24 19:30]: Booking Modification & Pitch Reassignment
*Details*: Implemented the ability to modify booking dates and reassign pitches directly from the occupancy view.
*Tech Notes*:
- Updated `BookingCreationModal` to support edit mode.
- Modified `/api/availability` to accept `exclude_booking_id`.
- Handled dynamic pricing recalculation during edits.

## [2026-04-24 19:20]: Dependency & Synchronization
*Details*: Performed a major sync with remote repository and resolved environment-related build errors.
*Tech Notes*:
- Git pull --rebase with conflict resolution.
- Installed missing Radix UI and jsPDF dependencies.
- Confirmed build stability.

## [2026-04-25 14:45]: Database Backup Feature (Admin Dashboard)
*Details*: Implemented a database backup/export functionality in the System Monitor (Admin) dashboard. This allows administrators to download the entire application data as a JSON file for security and archiving purposes.
*Tech Notes*:
- Created `generateBackupAction` in `src/app/sys-monitor/login/actions.ts` using `supabaseAdmin`.
- Tables included: `customers`, `bookings`, `booking_guests`, `pitches`, `sectors`, `pricing_seasons`, `customer_groups`, `group_season_configuration`, `group_bundles`, `app_logs`.
- Added "Download Database Backup" button to `DatabaseManagerWidget` with client-side blob download logic.
- UI integrated with `lucide-react` icons and loading states.
- Functionality is restricted to authenticated administrators in `/sys-monitor`.

## [2026-04-25 14:50]: Enhanced Backup with Table Selection
*Details*: Added the ability to select specific database tables for export in the Admin Dashboard.
*Tech Notes*:
- Updated `generateBackupAction` to accept an optional array of table names.
- Added a checklist UI with "Select/Deselect All" functionality in `DatabaseManagerWidget`.
- Dynamic filename generation based on export scope (`full` vs `partial`).

## [2026-04-30 12:00]: Reservation Deletion Feature
*Details*: Added the ability to permanently delete a reservation from the occupancy page to handle canceled bookings.
*Tech Notes*:
- Implemented `DELETE` method in `api/bookings/[id]/route.ts`.
- Added a destructive "Elimina" button in `BookingDetailsDialog.tsx` with confirmation prompt.
- Updated `SectorOccupancyViewer.tsx` to pass `onDeleteSuccess` callback to `BookingDetailsDialog` for refreshing the grid after deletion.

## [2026-04-30 12:10]: Custom Deletion Confirmation Dialog
*Details*: Replaced the default browser `window.confirm` with a custom `AlertDialog` component from Shadcn UI to maintain a cohesive user experience when deleting reservations.
*Tech Notes*:
- Integrated `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, and related components in `BookingDetailsDialog.tsx`.
## [2026-04-30 12:20]: Chart Readability & Premium Tooltip Implementation
*Details*: Improved chart tooltip visibility and aesthetics in the `/stats` page. Solved the "overlapping/transparent" issue by implementing a custom premium tooltip with better contrast and glassmorphism effects.
*Tech Notes*:
- Created `src/components/stats/CustomTooltip.tsx`: A flexible, premium tooltip component with `backdrop-blur-md`, solid background (`bg-card/95`), and refined typography.
- Integrated `CustomTooltip` into `RevenueChart.tsx` and `OccupancyChart.tsx`.
- Implemented a vertical cursor line (`strokeDasharray: '4 4'`) for both charts to improve mouse-tracking precision.
- Standardized currency and numeric formatting within the tooltips.
- Added Italian localization for date formatting in tooltips.
- Verified build stability with `npm run build`.

## [2026-04-30 12:25]: Multi-Guest Customer Registration at Check-in
*Details*: Modified the check-in flow so that ALL guests in a booking (not only the head of family) are saved as individual customer records in the `customers` table. This allows secondary guests (e.g., "Maria" in a 2-person booking) to be found and tracked in the Customers page.
*Tech Notes*:
- Created `src/app/api/customers/upsert-guest/route.ts`: New `POST` endpoint that performs a smart upsert. Match strategy: `first_name + last_name + birth_date` (case-insensitive). If a match is found, updates their anagrafica/document data. If not found, creates a new customer record.
- Since secondary guests don't have a phone number at check-in time, the `phone` field defaults to `''` (empty string) to satisfy the `NOT NULL` DB constraint.
- Modified `src/app/checkin/page.tsx` (`handleConfirmCheckIn`): After saving `booking_guests`, iterates over all non-head-of-family guests with valid names and calls `/api/customers/upsert-guest` for each. This is non-critical (failures are logged but don't block the check-in).
- TypeScript verified with `tsc --noEmit` — no errors.

## [2026-04-30 12:35]: Universal Error Logging Persistence
*Details*: Audited and updated all error logging across the entire application (Frontend Components, Library utilities, and API Endpoints) to ensure every `console.error` is also persisted to the Supabase `app_logs` table.
*Tech Notes*:
- Backend (`src/app/api`): Added `await logToDb('error', ...)` alongside `console.error` to ensure API failures are visible in the sys-monitor panel.
- Frontend/Shared (`src/app`, `src/components`, `src/lib`): Replaced raw `console.error` calls with the central `logger.error` utility from `src/lib/logger.ts`, which automatically queues the log for DB persistence via a Server Action.
- Fixed several TypeScript signature mismatches (`Expected 1-2 arguments, but got 3` etc.) to strictly comply with `logger.error(message: string, meta?: LogMeta)`.
- Verified build stability with `tsc --noEmit`. No regressions introduced.

## [2026-04-30 22:27]: Aggiunta opzione "Ieri" nel selettore data — Pagina Arrivi
*Details*: Aggiunta la voce "Ieri" come prima opzione nel selettore del periodo temporale nella pagina `/arrivals`. L'ordine risultante è: **Ieri | Oggi | Domani | Settimana**.
*Tech Notes*:
- `src/components/shared/DateToggle.tsx`: Aggiunto `'yesterday'` al tipo union `DateToggleProps` e button "Ieri" come primo elemento.
- `src/app/arrivals/page.tsx`: Aggiunto `'yesterday'` al tipo `ViewType`, importato `subDays` da `date-fns`, aggiunta logica per calcolare la data di ieri, aggiornato subtitle e messaggio "tutti completati", aggiornato `defaultDate` per `ArrivalsReportButton`.
- `src/components/shared/ArrivalsReportButton.tsx`: Aggiunto `'yesterday'` al tipo `view?` nell'interfaccia per compatibilità TypeScript.
- `src/app/departures/page.tsx`: Aggiornato `ViewType` locale per includere `'yesterday'` (compatibilità con `DateToggle` condiviso).
- Build verificata con `npm run build`. Nessuna regressione.

- [2026-05-04 16:30]: Fixed Seasonal Pricing Discrepancies
  - *Details*: Resolved multiple issues in the pricing logic that caused August bookings to show incorrect rates.
  - *Bug Fixes*:
    - Standardized date parsing using `parseISO` to fix "off-by-one" and timezone errors (last day of season was being excluded).
    - Fixed double-counting of children in the `POST /api/bookings` route.
    - Added persistence for `children_count`, `dogs_count`, and `cars_count` in the `bookings` table (code updated, migration provided).
  - *Tech Notes*:
    - Database: Added migration `supabase/migrations/add_booking_extras_columns.sql`.
    - Logic: `calculatePrice` and `getPriceBreakdown` now use local-time parsing for all input dates.
    - UI: `BookingCreationModal` correctly displays the applied season name.
  - *Critical Discovery*: Identified that existing seasons in the DB were set for 2025, causing 2026 bookings to fallback to the default low-season rate.
  - *Build Fixes*: Fixed TypeScript errors in `scripts/` (mock data missing `is_recurring`) to allow successful Vercel deployment.

## [2026-05-18 18:05]: Risoluzione bug conteggio ospiti/bambini in riapertura prenotazione
*Details*: Risolto il bug per cui rientrando in una prenotazione esistente (es. con 2 adulti e 1 bambino), il sistema mostrava 3 adulti e 1 bambino (incrementando gli adulti del numero di bambini ad ogni salvataggio/riapertura).
*Tech Notes*:
- `src/components/dashboard/BookingCreationModal.tsx`: Corretto il caricamento di `guestsCount` (Adulti) da `initialData`. Ora calcola gli adulti sottraendo i bambini (`children_count`) dal totale degli ospiti (`guests_count`), salvato in DB.
- Verificato che la computazione del prezzo in `pricing/calculate` e il salvataggio rimangono corretti e coerenti.
- Build verificata con successo tramite `npm run build`.

## [2026-05-19 14:50]: Supporto Tariffazione Manuale & Prezzi Personalizzati Amici
*Details*: Implementato il supporto completo per la tariffazione manuale e prezzi personalizzati. Consente di bypassare il calcolo automatico del prezzo sia in modo on-demand (tramite toggle nella creazione prenotazione) sia in modo automatico per gruppi di clienti specifici (es. "Amici" o "Clienti Fidelizzati").
*Tech Notes*:
- **Database**: Creata la migrazione `supabase/migrations/add_manual_pricing_support.sql` per aggiungere `force_manual_price` a `customer_groups` e `is_manual_price` a `bookings`.
- **TypeScript**: Aggiornati i tipi in `src/lib/types.ts` (`CustomerGroup`, `Booking`, `CreateBookingRequest`).
- **Backend API**:
  - `POST /api/bookings`: Rispetta il prezzo manuale se `is_manual_price` è attivo, salvando il flag nel DB.
  - `PATCH /api/bookings/[id]`: Consente l'aggiornamento del flag `is_manual_price`.
  - `groups` endpoints: Integrato il salvataggio di `force_manual_price` nelle chiamate POST e PUT.
- **Frontend UI**:
  - `GroupManagement.tsx`: Aggiunto switch "Forza Prezzo Manuale" che disabilita e nasconde le configurazioni tariffarie stagionali/sconti per quel gruppo e ne indica chiaramente lo stato manuale.
  - `BookingCreationModal.tsx`: Aggiunto toggle "Modifica prezzo manualmente" che trasforma il prezzo stimato in un campo di input modificabile. Se il cliente appartiene a un gruppo che forza il prezzo manuale, l'input viene abilitato automaticamente e il toggle rimosso per garantire coerenza.
  - `BookingDetailsDialog.tsx`: Mostra il prezzo totale della prenotazione e un badge "Manuale" se impostato manualmente.
- **Build**: Compilazione verificata con successo tramite Next.js Turbopack (`npm run build`).

## [2026-05-25 17:01]: Risoluzione Errore 500 Aggiornamento Cliente
*Details*: Risolto un Internal Server Error (500) che si verificava cliccando "Salva Modifiche" nell'anagrafica cliente a causa dell'invio di campi relazionali non validi per l'aggiornamento.
*Tech Notes*:
- I metodi `PATCH` e `PUT` in `src/app/api/customers/[id]/route.ts` non filtravano la proprietà relazionale `customer_groups` (inviata dal frontend insieme ai dati del cliente).
- Il tentativo di aggiornare direttamente la colonna (inesistente) `customer_groups` sulla tabella `customers` causava un'eccezione su Supabase.
- Aggiunta `customer_groups` alla destrutturazione per escluderla da `updateData` in entrambi i metodi.
- Build di verifica completata con successo tramite Next.js Turbopack (`npm run build`).

## [2026-05-29 16:00]: Persistenza Gruppo Cliente da Prenotazione
*Details*: Risolto il bug per cui l'assegnazione di un cliente a un gruppo dalla prenotazione non veniva mantenuta alla riapertura della prenotazione. Il modale ora inizializza correttamente il gruppo dal cliente collegato e gli endpoint prenotazione salvano `customers.group_id` anche quando il cliente esiste già.
*Tech Notes*:
- `BookingCreationModal.tsx`: carica `initialData.customer.group_id`, aggiorna il gruppo quando si seleziona un cliente esistente e invia `group_id` in modo esplicito durante modifica/assegnazione.
- `POST /api/bookings`: aggiorna il gruppo dei clienti esistenti, calcola il prezzo server-side tenendo conto delle configurazioni e dei bundle del gruppo, e non ignora più errori di aggiornamento cliente.
- `PATCH /api/bookings/[id]`: include `group_id` negli aggiornamenti cliente e restituisce errore se il salvataggio cliente fallisce.
- `GET /api/pricing/calculate`: corretta la tabella `group_season_configuration` e gestita la selezione esplicita di "nessun gruppo".
- Build verificata con successo tramite `npm run build`.

## [2026-06-01 11:43]: Ricerca globale per targa e fix parametro query
*Details*: Aggiunta la possibilità di cercare un cliente inserendo la targa del veicolo nella barra di ricerca globale (GlobalSearchBar).
*Tech Notes*:
- `src/app/api/customers/route.ts`: Modificata la logica per supportare sia il query param `q` che `search` (utilizzato dal componente `GlobalSearchBar`). Aggiunta la colonna `license_plate` alla query `.or` con operatore `ilike`.
- `src/components/dashboard/GlobalSearchBar.tsx`: Aggiornato il testo del placeholder per indicare esplicitamente che è possibile cercare per targa.

## [2026-06-04 10:40]: Client-side Error Fix (Invalid Time Value & Recharts)
*Details*: Fixed a client-side crash occurring on the Check-in page due to an invalid time value provided to `date-fns`, and resolved `Recharts` layout warnings.
*Tech Notes*:
- `parseBookingPeriod`: Refactored to safely handle empty/invalid strings and correctly fallback to safe dates instead of crashing `format()` calls. Applied the fix in `src/app/checkin/page.tsx`, `src/components/shared/CheckInDialog.tsx`, and `src/app/customers/[id]/page.tsx`.
- `ResponsiveContainer`: Added `minWidth={0}` and `minHeight={0}` to all chart responsive containers (`RevenueChart.tsx`, `OccupancyChart.tsx`, `DemoStatsWidget.tsx`, `DemoHeroDashboard.tsx`) to resolve Recharts warnings during flex layout calculations.
- Confirmed that `NEXT_REDIRECT` error logs are expected Next.js 307 redirect behaviors for non-authenticated/middleware routes and not a crash source.

## [2026-06-09 17:20]: Feature - Occupancy PDF Export
*Details*: Added a feature allowing users to export the current sector occupancy matrix to a professional, clear PDF document. The generated PDF uses a visual matrix with colored cells (Green for available, Red for occupied) to match the UI.
*Tech Notes*:
- Installed `jspdf` and `jspdf-autotable` dependencies.
- `src/lib/exportOccupancy.ts`: Created utility `exportOccupancyToPDF` to parse the `displayedData` and generate a paginated PDF using A4 landscape orientation and `autotable` hooks for cell coloring based on availability. Updated to extract and display the surname of the customer in occupied slots instead of an abbreviation.
- `src/components/dashboard/SectorOccupancyViewer.tsx`: Added an "Esporta PDF" button next to "Aggiorna", which delegates the currently filtered `displayedData`, sector, and timeframe to the export utility.

## [2026-06-23] 🌙 Night Implementation — Security & Data-Integrity Hardening (branch `fix/security-and-data-integrity`)
*Details*: Working through the findings in `CODEBASE_ANALYSIS.md` step by step (implement → test → commit). DB changes are delivered as SQL migration files for the user to run manually (live DB has real data; no structural revolution).

### CURRENT STATUS / RESUME POINT
- **Branch**: `fix/security-and-data-integrity` (off `dbaf8e42`).
- **Done**: (see commits below)
- **In progress / next**: C-4 (customers filter injection) → C-5 (remove /api/fix-db) → C-1/C-2 (signed-session auth) → N-2 (personal_id_code column) → H-5 (price recalc on edit) → N-1 (dead code) → L-1 (.bak files) → M-5 (security headers) → docs.
- **Pending user action**: run SQL files listed in `TO_SIMO_DO.md` (C-3 migration first).

### Changelog
- **C-3** (DB, pending user run): `20260623100000_drop_public_group_policies.sql` — drops `{public}` RLS policies on customer_groups / group_bundles / group_season_configuration. App is unaffected (uses service role).
- **C-4** (code): `/api/customers` GET — sanitize user `q` before the PostgREST `.or()` filter (injection fix) + reassign query builder.
- **C-5** (code): removed `/api/fix-db` GET mutation route.
- **C-1/C-2** (code): NEW `src/lib/auth.ts` — Edge-compatible HMAC-SHA256 signed, expiring session tokens. `middleware.ts` now verifies the signature (was: presence-only). `login/actions.ts` and `sys-monitor/login/actions.ts` issue signed tokens; `getAuthStatus()` verifies them. Forged `=true` cookies are now rejected (unit-tested). Signing secret = `AUTH_SECRET` || `ADMIN_PASSWORD`. **Side effect: existing sessions invalidated → re-login once.**
- **N-2** (DB pending + code): migration `20260623101000_add_personal_id_code.sql` adds `customers.personal_id_code`. Hardened `POST /api/customers` with an allow-list (fixes mass-assignment + includes the Codice Fiscale field; skips empty optionals).
- **H-1** (code): `POST /api/bookings` now rolls back a newly-created customer if the booking insert fails (compensating delete), preventing orphan customers without a structural RPC rewrite. Added read-only `supabase/diagnostics/orphan_customers.sql` to triage the existing 890 orphans (user's call; no auto-delete).
- **H-5** (code): extracted shared `src/lib/bookingPricing.ts` (`calculateBookingPrice`). POST now uses it; PATCH `/api/bookings/[id]` recalculates `total_price` when pricing-relevant fields change and the booking isn't manual (server authoritative). Recalc is wrapped in try/catch so a calc failure can't break an otherwise-valid edit.
- **N-1** (code): deleted dead `src/lib/api/stats.ts` and the unused anon `src/lib/supabase/client.ts`. The app is now 100% service-role server-side (no anon key shipped/used).
- **L-1** (cleanup): removed 4 tracked `.bak/.backup*` files.
- **M-5** (code): added conservative security headers in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy, X-DNS-Prefetch-Control). CSP deferred (needs nonce work). Verified live via curl; also confirmed a forged `campflow_auth=true` cookie now returns 401.
- **L-3** (docs): `env.example` now documents the required `ADMIN_USERNAME`/`ADMIN_PASSWORD` and the recommended `AUTH_SECRET`.
- **L-4** (docs): README corrected — removed false PWA/offline claims, fixed Next.js 15→16, softened the "atomic transaction" wording to match reality.
- **N-4** (types): added `is_head_of_family` to `BookingGuest`.
- **H-2/H-3** (docs): added a prominent STALE warning to `fresh-install/00_init_database.sql` pointing fresh installs to the incremental path (authoritative). Full schema regeneration deferred (needs a live pg_dump).
- **Tests** (infra): added Vitest + `npm test`. `src/lib/auth.test.ts` (7 tests) locks in the signed-token security properties; `src/lib/pricing.test.ts` (8 tests) covers season selection + price calculation. 15/15 passing. (Overbooking regression test M-6 needs a DB and is deferred.)

### ✅ SESSION COMPLETE (2026-06-23 night)
All **safe, non-structural** fixes from CODEBASE_ANALYSIS.md are implemented, tested and committed on `fix/security-and-data-integrity` (14 commits). Final state: `npm test` 18/18 pass, `npm run build` OK, new files lint-clean (pre-existing `any` lint debt = deferred M-3).

**Awaiting user:**
1. Run the 2 SQL files in TO_SIMO_DO.md (C-3 drop public policies, N-2 add personal_id_code).
2. Re-login once (auth cookie format changed).
3. Decide: N-3 guest-name canonical field, M-1 discount/bundle rule, and whether to regenerate fresh-install from a live pg_dump (H-2/H-3).

**Deliberately deferred (need a decision / DB / carry risk):** N-3, full migration consolidation, CSP, M-6 overbooking DB test, M-2 logger coupling, M-3 any/console cleanup, M-4 component decomposition.

## [2026-06-23] Grilling decisions (branch `fix/schema-regen-and-followups`)
Resolved via /grill-me. Implementation pending (DB regen first, then code).

**M-1 — Pricing model: KEEP AS-IS, now the official spec:**
- One mode per (group, season): discount % XOR custom rates XOR bundle. Never combined.
- Stay longer than bundle: bundle nights at bundle price, remaining nights at standard season rate.
- Multiple bundles per season: apply the single longest-fit bundle once; NO tiling.
- Stay shorter than the smallest bundle (bundle-mode group): standard season rate, no group benefit. → ADD an inline IT heads-up in BookingCreationModal (candidate: "Nessuna offerta applicabile a questa durata — tariffe standard applicate.").
- Extras (dog/car) not in a bundle's unit_prices: billed at standard season rate on bundle nights.

**N-3 — Guest names: KEEP full_name as a computed display field.**
- Remove the DEAD booking-time `guest_names` path in POST /api/bookings (no caller).
- Make the one reader (BookingDetailsDialog) fall back to `${last_name} ${first_name}` when full_name is empty.

**H-2/H-3 — Schema regen: option (b).** User runs `supabase/diagnostics/schema_introspection.sql` in the SQL Editor; I reconstruct a single authoritative `fresh-install/00_init_database.sql` from the output, then retire the stale/duplicate files.

**Out of scope this round:** CSP, M-3 (any/console), M-4 (component decomposition), M-2 (logger), L-5/L-6 (doc consolidation).

### NEXT STEP: awaiting schema_introspection.sql output, then regenerate schema; afterwards implement M-1 heads-up + N-3.
