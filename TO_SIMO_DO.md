# TO SIMO DO

## High Priority
- [ ] **Run Migration**: Execute the new seed migration to populate the database with test data.
  - Run: `supabase db reset` (WARNING: Wipes data) OR apply just this file via dashboard/CLI if preserving other data is needed.
  - Recommended for clean test: 
    ```bash
    npx supabase migration up
    ```
    *If you are using local Supabase.* If you are using a remote project, copy the content of `supabase/migrations/20260120130000_seed_test_bookings.sql` to the SQL Editor in the Supabase Dashboard and run it.

## Testing
- [ ] Check `/customers` to see generated profiles.
- [ ] Check `/checkin` to see upcoming arrivals/departures.
- [ ] Check Dashboard stats for occupancy changes.
