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
