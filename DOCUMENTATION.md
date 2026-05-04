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
