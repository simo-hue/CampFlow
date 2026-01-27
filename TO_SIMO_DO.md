# Actions Required by Simo

2.  **Verify Booking Calculation**:al)**:
    *   Execution file: `supabase/migrations/seed_default_season.sql`
    *   Also run the new mid-season script:
    *   Execution file: `supabase/migrations/seed_mid_season.sql`
    *   And the new high-season script:
    *   Execution file: `supabase/migrations/seed_high_season.sql`
    *   Run these in your Supabase SQL editor or via CLI.base, check the `pricing_seasons` table to confirm `person_price_per_day` and other new columns are populated correctly.

    ----------------
    |stagione media|     ----------------
                         |stagione media|
----------------------------------------
|stagione di default con priorità bassa|
----------------------------------------