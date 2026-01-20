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
