-- =====================================================
-- CampFlow — Live DB Audit (READ-ONLY / SAFE)
-- =====================================================
-- Run this in the Supabase SQL Editor and paste back the
-- result of EACH query (labeled by the "check" column).
-- Nothing here writes/deletes data — only SELECTs.
-- =====================================================

-- 1) RLS STATUS PER TABLE  (resolves C-3)
--    rls_enabled = false on customers/bookings/booking_guests
--    means the PUBLIC anon key can read all PII.
SELECT '1_rls_status' AS check, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

| check        | tablename                  | rls_enabled |
| ------------ | -------------------------- | ----------- |
| 1_rls_status | app_logs                   | true        |
| 1_rls_status | booking_guests             | true        |
| 1_rls_status | bookings                   | true        |
| 1_rls_status | customer_groups            | true        |
| 1_rls_status | customers                  | true        |
| 1_rls_status | group_bundles              | true        |
| 1_rls_status | group_season_configuration | true        |
| 1_rls_status | pitches                    | true        |
| 1_rls_status | pricing_seasons            | true        |
| 1_rls_status | sectors                    | true        |


-- 2) RLS POLICIES + TARGET ROLES  (resolves C-3)
--    Look for any policy granting 'anon' access, or the absence of policies.
SELECT '2_rls_policies' AS check, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

| check          | tablename                  | policyname                                                      | roles           | cmd    |
| -------------- | -------------------------- | --------------------------------------------------------------- | --------------- | ------ |
| 2_rls_policies | app_logs                   | Allow service role to insert logs                               | {service_role}  | INSERT |
| 2_rls_policies | app_logs                   | Enable read access for authenticated users                      | {authenticated} | SELECT |
| 2_rls_policies | booking_guests             | Authenticated users have full access to booking_guests          | {authenticated} | ALL    |
| 2_rls_policies | bookings                   | Authenticated users have full access to bookings                | {authenticated} | ALL    |
| 2_rls_policies | customer_groups            | Enable all access for all users                                 | {public}        | ALL    |
| 2_rls_policies | customer_groups            | Enable all for authenticated users on customer_groups           | {authenticated} | ALL    |
| 2_rls_policies | customers                  | Authenticated users have full access to customers               | {authenticated} | ALL    |
| 2_rls_policies | group_bundles              | Enable all access for all users                                 | {public}        | ALL    |
| 2_rls_policies | group_season_configuration | Enable all access for all users                                 | {public}        | ALL    |
| 2_rls_policies | group_season_configuration | Enable all for authenticated users on group_season_configuratio | {authenticated} | ALL    |
| 2_rls_policies | pitches                    | Authenticated users have full access to pitches                 | {authenticated} | ALL    |
| 2_rls_policies | pricing_seasons            | Authenticated users have full access to pricing_seasons         | {authenticated} | ALL    |
| 2_rls_policies | sectors                    | Authenticated users have full access to sectors                 | {authenticated} | ALL    |

-- 3) CUSTOMERS COLUMNS  (resolves H-2: first_name/last_name vs full_name)
SELECT '3_customers_cols' AS check, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

| check            | column_name            | data_type                | is_nullable |
| ---------------- | ---------------------- | ------------------------ | ----------- |
| 3_customers_cols | id                     | uuid                     | NO          |
| 3_customers_cols | email                  | character varying        | YES         |
| 3_customers_cols | phone                  | character varying        | NO          |
| 3_customers_cols | address                | text                     | YES         |
| 3_customers_cols | notes                  | text                     | YES         |
| 3_customers_cols | created_at             | timestamp with time zone | NO          |
| 3_customers_cols | updated_at             | timestamp with time zone | NO          |
| 3_customers_cols | first_name             | character varying        | NO          |
| 3_customers_cols | last_name              | character varying        | NO          |
| 3_customers_cols | birth_date             | date                     | YES         |
| 3_customers_cols | birth_country          | character varying        | YES         |
| 3_customers_cols | birth_city             | character varying        | YES         |
| 3_customers_cols | birth_province         | character varying        | YES         |
| 3_customers_cols | citizenship            | character varying        | YES         |
| 3_customers_cols | gender                 | character varying        | YES         |
| 3_customers_cols | residence_country      | character varying        | YES         |
| 3_customers_cols | residence_province     | character varying        | YES         |
| 3_customers_cols | residence_city         | character varying        | YES         |
| 3_customers_cols | residence_zip          | character varying        | YES         |
| 3_customers_cols | document_type          | character varying        | YES         |
| 3_customers_cols | document_number        | character varying        | YES         |
| 3_customers_cols | document_issue_country | character varying        | YES         |
| 3_customers_cols | document_issue_city    | character varying        | YES         |
| 3_customers_cols | document_issue_date    | date                     | YES         |
| 3_customers_cols | document_issuer        | character varying        | YES         |
| 3_customers_cols | license_plate          | character varying        | YES         |
| 3_customers_cols | group_id               | uuid                     | YES         |

-- 4) BOOKINGS COLUMNS  (resolves H-2 + H-4)
--    Expect: children_count, dogs_count, cars_count, is_manual_price.
--    KEY QUESTION: does 'questura_sent' exist here? (H-4)
SELECT '4_bookings_cols' AS check, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

| check           | column_name     | data_type                | column_default                 |
| --------------- | --------------- | ------------------------ | ------------------------------ |
| 4_bookings_cols | id              | uuid                     | gen_random_uuid()              |
| 4_bookings_cols | pitch_id        | uuid                     | null                           |
| 4_bookings_cols | customer_id     | uuid                     | null                           |
| 4_bookings_cols | booking_period  | daterange                | null                           |
| 4_bookings_cols | guests_count    | integer                  | null                           |
| 4_bookings_cols | total_price     | numeric                  | null                           |
| 4_bookings_cols | status          | character varying        | 'confirmed'::character varying |
| 4_bookings_cols | notes           | text                     | null                           |
| 4_bookings_cols | created_at      | timestamp with time zone | now()                          |
| 4_bookings_cols | updated_at      | timestamp with time zone | now()                          |
| 4_bookings_cols | dogs_count      | integer                  | 0                              |
| 4_bookings_cols | questura_sent   | boolean                  | false                          |
| 4_bookings_cols | children_count  | integer                  | 0                              |
| 4_bookings_cols | cars_count      | integer                  | 0                              |
| 4_bookings_cols | is_manual_price | boolean                  | false                          |

-- 5) BOOKING_GUESTS COLUMNS  (H-4: questura_status lives here?)
SELECT '5_booking_guests_cols' AS check, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'booking_guests'
ORDER BY ordinal_position;

| check                 | column_name            | data_type                |
| --------------------- | ---------------------- | ------------------------ |
| 5_booking_guests_cols | id                     | uuid                     |
| 5_booking_guests_cols | booking_id             | uuid                     |
| 5_booking_guests_cols | full_name              | character varying        |
| 5_booking_guests_cols | birth_date             | date                     |
| 5_booking_guests_cols | birth_place            | character varying        |
| 5_booking_guests_cols | address                | text                     |
| 5_booking_guests_cols | document_type          | character varying        |
| 5_booking_guests_cols | document_number        | character varying        |
| 5_booking_guests_cols | nationality            | character varying        |
| 5_booking_guests_cols | guest_type             | character varying        |
| 5_booking_guests_cols | created_at             | timestamp with time zone |
| 5_booking_guests_cols | updated_at             | timestamp with time zone |
| 5_booking_guests_cols | first_name             | character varying        |
| 5_booking_guests_cols | last_name              | character varying        |
| 5_booking_guests_cols | gender                 | character varying        |
| 5_booking_guests_cols | citizenship            | character varying        |
| 5_booking_guests_cols | birth_country          | character varying        |
| 5_booking_guests_cols | birth_province         | character varying        |
| 5_booking_guests_cols | birth_city             | character varying        |
| 5_booking_guests_cols | is_head_of_family      | boolean                  |
| 5_booking_guests_cols | residence_country      | character varying        |
| 5_booking_guests_cols | residence_province     | character varying        |
| 5_booking_guests_cols | residence_city         | character varying        |
| 5_booking_guests_cols | residence_zip          | character varying        |
| 5_booking_guests_cols | document_issue_date    | date                     |
| 5_booking_guests_cols | document_issuer        | character varying        |
| 5_booking_guests_cols | document_issue_city    | character varying        |
| 5_booking_guests_cols | document_issue_country | character varying        |
| 5_booking_guests_cols | license_plate          | character varying        |

-- 6) PRICING_SEASONS COLUMNS  (resolves H-2: is_recurring present?)
SELECT '6_pricing_seasons_cols' AS check, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pricing_seasons'
ORDER BY ordinal_position;

| check                  | column_name            | data_type                |
| ---------------------- | ---------------------- | ------------------------ |
| 6_pricing_seasons_cols | id                     | uuid                     |
| 6_pricing_seasons_cols | name                   | character varying        |
| 6_pricing_seasons_cols | description            | text                     |
| 6_pricing_seasons_cols | start_date             | date                     |
| 6_pricing_seasons_cols | end_date               | date                     |
| 6_pricing_seasons_cols | piazzola_price_per_day | numeric                  |
| 6_pricing_seasons_cols | tenda_price_per_day    | numeric                  |
| 6_pricing_seasons_cols | priority               | integer                  |
| 6_pricing_seasons_cols | color                  | character varying        |
| 6_pricing_seasons_cols | is_active              | boolean                  |
| 6_pricing_seasons_cols | created_at             | timestamp with time zone |
| 6_pricing_seasons_cols | updated_at             | timestamp with time zone |
| 6_pricing_seasons_cols | person_price_per_day   | numeric                  |
| 6_pricing_seasons_cols | child_price_per_day    | numeric                  |
| 6_pricing_seasons_cols | dog_price_per_day      | numeric                  |
| 6_pricing_seasons_cols | car_price_per_day      | numeric                  |
| 6_pricing_seasons_cols | is_recurring           | boolean                  |

-- 7) DOES ANY ACTIVE SEASON COVER TODAY?  (resolves H-2 €0 risk)
--    If this returns 0 rows, current-day pricing falls back to "Nessuna Stagione" (0).
SELECT '7_seasons_covering_today' AS check, id, name, start_date, end_date,
       COALESCE(is_recurring::text, 'COLUMN_MISSING') AS is_recurring, is_active, priority
FROM pricing_seasons
WHERE is_active = true
ORDER BY priority DESC;

| check                    | id                                   | name                     | start_date | end_date   | is_recurring | is_active | priority |
| ------------------------ | ------------------------------------ | ------------------------ | ---------- | ---------- | ------------ | --------- | -------- |
| 7_seasons_covering_today | 90a55632-305c-4a50-9d65-039c190e6664 | Alta Stagione            | 2026-07-24 | 2026-08-30 | true         | true      | 20       |
| 7_seasons_covering_today | 21733cb0-2ff3-4714-9197-bc1c7ce7dacf | Media Stagione           | 2026-06-12 | 2026-07-23 | true         | true      | 10       |
| 7_seasons_covering_today | 67aa03dc-619d-4749-90e5-d273ff7052dc | Bassa Stagione (Default) | 2026-01-01 | 2050-12-31 | true         | true      | 0        |

-- 8) APP_LOGS SHAPE  (resolves M-2 / H-2: meta vs metadata, timestamp vs created_at)
SELECT '8_app_logs_cols' AS check, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'app_logs'
ORDER BY ordinal_position;

| check           | column_name | data_type                |
| --------------- | ----------- | ------------------------ |
| 8_app_logs_cols | id          | uuid                     |
| 8_app_logs_cols | timestamp   | timestamp with time zone |
| 8_app_logs_cols | level       | text                     |
| 8_app_logs_cols | message     | text                     |
| 8_app_logs_cols | meta        | jsonb                    |
| 8_app_logs_cols | environment | text                     |

-- 9) REQUIRED FUNCTIONS PRESENT?  (sys-monitor + /api/dev/* depend on these)
SELECT '9_functions' AS check, proname AS function_name
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND proname IN ('get_dashboard_stats','get_db_stats','vacuum_analyze_all',
                  'get_storage_stats','get_weekly_occupancy','get_price_for_date')
ORDER BY proname;

| check       | function_name       |
| ----------- | ------------------- |
| 9_functions | get_dashboard_stats |
| 9_functions | get_db_stats        |
| 9_functions | get_price_for_date  |
| 9_functions | get_storage_stats   |
| 9_functions | vacuum_analyze_all  |

-- 10) ANTI-OVERBOOKING CONSTRAINT PRESENT?  (core guarantee)
SELECT '10_overbooking_constraint' AS check, conname, contype
FROM pg_constraint
WHERE conname = 'prevent_overbooking';

| check                     | conname             | contype |
| ------------------------- | ------------------- | ------- |
| 10_overbooking_constraint | prevent_overbooking | x       |

-- 11) ORPHANED CUSTOMERS (no bookings) — signal for H-1 non-atomic inserts
SELECT '11_orphan_customers' AS check, COUNT(*) AS customers_with_no_bookings
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = c.id);
| check               | customers_with_no_bookings |
| ------------------- | -------------------------- |
| 11_orphan_customers | 890                        |

-- 12) ROW COUNTS (context)

| check         | customers | bookings | booking_guests | pitches | seasons |
| ------------- | --------- | -------- | -------------- | ------- | ------- |
| 12_row_counts | 1720      | 896      | 1644           | 290     | 3       |