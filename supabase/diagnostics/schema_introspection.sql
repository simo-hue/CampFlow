SELECT '1_extensions' AS section,
       e.extname AS extension,
       n.nspname AS schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;

| section      | extension          | schema     |
| ------------ | ------------------ | ---------- |
| 1_extensions | btree_gist         | extensions |
| 1_extensions | hypopg             | extensions |
| 1_extensions | index_advisor      | extensions |
| 1_extensions | pg_stat_statements | extensions |
| 1_extensions | pgcrypto           | extensions |
| 1_extensions | plpgsql            | pg_catalog |
| 1_extensions | supabase_vault     | vault      |
| 1_extensions | uuid-ossp          | extensions |

-- 2) TABLES + COLUMNS (ordered) — I assemble CREATE TABLE from this.
SELECT '2_columns' AS section,
       c.table_name,
       c.ordinal_position AS pos,
       c.column_name,
       c.data_type,
       c.udt_name,                       -- disambiguates daterange / enums
       c.character_maximum_length        AS char_len,
       c.numeric_precision               AS num_prec,
       c.numeric_scale                   AS num_scale,
       c.is_nullable,
       c.column_default
FROM information_schema.columns c
JOIN information_schema.tables t
  ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE c.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY c.table_name, c.ordinal_position;

| section   | table_name                 | pos | column_name            | data_type                | udt_name    | char_len | num_prec | num_scale | is_nullable | column_default                 |
| --------- | -------------------------- | --- | ---------------------- | ------------------------ | ----------- | -------- | -------- | --------- | ----------- | ------------------------------ |
| 2_columns | app_logs                   | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | app_logs                   | 2   | timestamp              | timestamp with time zone | timestamptz | null     | null     | null      | NO          | timezone('utc'::text, now())   |
| 2_columns | app_logs                   | 3   | level                  | text                     | text        | null     | null     | null      | NO          | null                           |
| 2_columns | app_logs                   | 4   | message                | text                     | text        | null     | null     | null      | NO          | null                           |
| 2_columns | app_logs                   | 5   | meta                   | jsonb                    | jsonb       | null     | null     | null      | YES         | null                           |
| 2_columns | app_logs                   | 6   | environment            | text                     | text        | null     | null     | null      | YES         | 'development'::text            |
| 2_columns | booking_guests             | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | booking_guests             | 2   | booking_id             | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | booking_guests             | 3   | full_name              | character varying        | varchar     | 255      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 4   | birth_date             | date                     | date        | null     | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 5   | birth_place            | character varying        | varchar     | 255      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 6   | address                | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 7   | document_type          | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 8   | document_number        | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 9   | nationality            | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 10  | guest_type             | character varying        | varchar     | 20       | null     | null      | NO          | 'adult'::character varying     |
| 2_columns | booking_guests             | 11  | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | booking_guests             | 12  | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | booking_guests             | 13  | first_name             | character varying        | varchar     | 255      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 14  | last_name              | character varying        | varchar     | 255      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 15  | gender                 | character varying        | varchar     | 10       | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 16  | citizenship            | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 17  | birth_country          | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 18  | birth_province         | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 19  | birth_city             | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 20  | is_head_of_family      | boolean                  | bool        | null     | null     | null      | YES         | false                          |
| 2_columns | booking_guests             | 21  | residence_country      | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 22  | residence_province     | character varying        | varchar     | 10       | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 23  | residence_city         | character varying        | varchar     | 150      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 24  | residence_zip          | character varying        | varchar     | 10       | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 25  | document_issue_date    | date                     | date        | null     | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 26  | document_issuer        | character varying        | varchar     | 150      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 27  | document_issue_city    | character varying        | varchar     | 150      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 28  | document_issue_country | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | booking_guests             | 29  | license_plate          | character varying        | varchar     | 20       | null     | null      | YES         | null                           |
| 2_columns | bookings                   | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | bookings                   | 2   | pitch_id               | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | bookings                   | 3   | customer_id            | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | bookings                   | 4   | booking_period         | daterange                | daterange   | null     | null     | null      | NO          | null                           |
| 2_columns | bookings                   | 5   | guests_count           | integer                  | int4        | null     | 32       | 0         | NO          | null                           |
| 2_columns | bookings                   | 6   | total_price            | numeric                  | numeric     | null     | 10       | 2         | NO          | null                           |
| 2_columns | bookings                   | 7   | status                 | character varying        | varchar     | 50       | null     | null      | NO          | 'confirmed'::character varying |
| 2_columns | bookings                   | 8   | notes                  | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | bookings                   | 9   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | bookings                   | 10  | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | bookings                   | 11  | dogs_count             | integer                  | int4        | null     | 32       | 0         | NO          | 0                              |
| 2_columns | bookings                   | 12  | questura_sent          | boolean                  | bool        | null     | null     | null      | NO          | false                          |
| 2_columns | bookings                   | 13  | children_count         | integer                  | int4        | null     | 32       | 0         | YES         | 0                              |
| 2_columns | bookings                   | 14  | cars_count             | integer                  | int4        | null     | 32       | 0         | YES         | 0                              |
| 2_columns | bookings                   | 15  | is_manual_price        | boolean                  | bool        | null     | null     | null      | NO          | false                          |
| 2_columns | customer_groups            | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | customer_groups            | 2   | name                   | text                     | text        | null     | null     | null      | NO          | null                           |
| 2_columns | customer_groups            | 3   | description            | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | customer_groups            | 4   | color                  | text                     | text        | null     | null     | null      | YES         | '#3b82f6'::text                |
| 2_columns | customer_groups            | 5   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | YES         | now()                          |
| 2_columns | customer_groups            | 6   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | customer_groups            | 7   | force_manual_price     | boolean                  | bool        | null     | null     | null      | NO          | false                          |
| 2_columns | customers                  | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | customers                  | 3   | email                  | character varying        | varchar     | 255      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 4   | phone                  | character varying        | varchar     | 50       | null     | null      | NO          | null                           |
| 2_columns | customers                  | 5   | address                | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | customers                  | 6   | notes                  | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | customers                  | 7   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | customers                  | 8   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | customers                  | 9   | first_name             | character varying        | varchar     | 100      | null     | null      | NO          | null                           |
| 2_columns | customers                  | 10  | last_name              | character varying        | varchar     | 100      | null     | null      | NO          | null                           |
| 2_columns | customers                  | 11  | birth_date             | date                     | date        | null     | null     | null      | YES         | null                           |
| 2_columns | customers                  | 12  | birth_country          | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 13  | birth_city             | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 14  | birth_province         | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 15  | citizenship            | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 16  | gender                 | character varying        | varchar     | 10       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 17  | residence_country      | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 18  | residence_province     | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 19  | residence_city         | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 20  | residence_zip          | character varying        | varchar     | 20       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 21  | document_type          | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 22  | document_number        | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 23  | document_issue_country | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 24  | document_issue_city    | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 25  | document_issue_date    | date                     | date        | null     | null     | null      | YES         | null                           |
| 2_columns | customers                  | 26  | document_issuer        | character varying        | varchar     | 100      | null     | null      | YES         | null                           |
| 2_columns | customers                  | 27  | license_plate          | character varying        | varchar     | 20       | null     | null      | YES         | null                           |
| 2_columns | customers                  | 28  | group_id               | uuid                     | uuid        | null     | null     | null      | YES         | null                           |
| 2_columns | customers                  | 29  | personal_id_code       | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | group_bundles              | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | group_bundles              | 2   | group_id               | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | group_bundles              | 3   | nights                 | integer                  | int4        | null     | 32       | 0         | NO          | null                           |
| 2_columns | group_bundles              | 4   | pitch_price            | numeric                  | numeric     | null     | 10       | 2         | NO          | null                           |
| 2_columns | group_bundles              | 6   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | group_bundles              | 7   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | group_bundles              | 8   | unit_prices            | jsonb                    | jsonb       | null     | null     | null      | YES         | '{}'::jsonb                    |
| 2_columns | group_bundles              | 9   | season_id              | uuid                     | uuid        | null     | null     | null      | YES         | null                           |
| 2_columns | group_season_configuration | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | group_season_configuration | 2   | group_id               | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | group_season_configuration | 3   | season_id              | uuid                     | uuid        | null     | null     | null      | NO          | null                           |
| 2_columns | group_season_configuration | 4   | discount_percentage    | numeric                  | numeric     | null     | 5        | 2         | YES         | null                           |
| 2_columns | group_season_configuration | 5   | custom_rates           | jsonb                    | jsonb       | null     | null     | null      | YES         | null                           |
| 2_columns | group_season_configuration | 6   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | YES         | now()                          |
| 2_columns | group_season_configuration | 7   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | YES         | now()                          |
| 2_columns | pitches                    | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | pitches                    | 2   | number                 | character varying        | varchar     | 10       | null     | null      | NO          | null                           |
| 2_columns | pitches                    | 3   | suffix                 | character varying        | varchar     | 1        | null     | null      | NO          | ''::character varying          |
| 2_columns | pitches                    | 4   | type                   | character varying        | varchar     | 50       | null     | null      | NO          | null                           |
| 2_columns | pitches                    | 5   | attributes             | jsonb                    | jsonb       | null     | null     | null      | NO          | '{}'::jsonb                    |
| 2_columns | pitches                    | 6   | status                 | character varying        | varchar     | 20       | null     | null      | NO          | 'available'::character varying |
| 2_columns | pitches                    | 7   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | pitches                    | 8   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | pitches                    | 9   | sector_id              | character varying        | varchar     | 50       | null     | null      | YES         | null                           |
| 2_columns | pricing_seasons            | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | pricing_seasons            | 2   | name                   | character varying        | varchar     | 100      | null     | null      | NO          | null                           |
| 2_columns | pricing_seasons            | 3   | description            | text                     | text        | null     | null     | null      | YES         | null                           |
| 2_columns | pricing_seasons            | 4   | start_date             | date                     | date        | null     | null     | null      | NO          | null                           |
| 2_columns | pricing_seasons            | 5   | end_date               | date                     | date        | null     | null     | null      | NO          | null                           |
| 2_columns | pricing_seasons            | 6   | piazzola_price_per_day | numeric                  | numeric     | null     | 10       | 2         | NO          | null                           |
| 2_columns | pricing_seasons            | 7   | tenda_price_per_day    | numeric                  | numeric     | null     | 10       | 2         | NO          | null                           |
| 2_columns | pricing_seasons            | 8   | priority               | integer                  | int4        | null     | 32       | 0         | NO          | 0                              |
| 2_columns | pricing_seasons            | 9   | color                  | character varying        | varchar     | 7        | null     | null      | YES         | '#3b82f6'::character varying   |
| 2_columns | pricing_seasons            | 10  | is_active              | boolean                  | bool        | null     | null     | null      | NO          | true                           |
| 2_columns | pricing_seasons            | 11  | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | pricing_seasons            | 12  | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | pricing_seasons            | 13  | person_price_per_day   | numeric                  | numeric     | null     | 10       | 2         | NO          | 0                              |
| 2_columns | pricing_seasons            | 14  | child_price_per_day    | numeric                  | numeric     | null     | 10       | 2         | NO          | 0                              |
| 2_columns | pricing_seasons            | 15  | dog_price_per_day      | numeric                  | numeric     | null     | 10       | 2         | NO          | 0                              |
| 2_columns | pricing_seasons            | 16  | car_price_per_day      | numeric                  | numeric     | null     | 10       | 2         | NO          | 0                              |
| 2_columns | pricing_seasons            | 17  | is_recurring           | boolean                  | bool        | null     | null     | null      | YES         | true                           |
| 2_columns | sectors                    | 1   | id                     | uuid                     | uuid        | null     | null     | null      | NO          | gen_random_uuid()              |
| 2_columns | sectors                    | 2   | name                   | character varying        | varchar     | 255      | null     | null      | NO          | null                           |
| 2_columns | sectors                    | 3   | created_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |
| 2_columns | sectors                    | 4   | updated_at             | timestamp with time zone | timestamptz | null     | null     | null      | NO          | now()                          |


-- 3) CONSTRAINTS (PK / FK / UNIQUE / CHECK / EXCLUDE) — exact DDL
SELECT '3_constraints' AS section,
       conrelid::regclass::text AS table_name,
       conname AS constraint_name,
       CASE contype
         WHEN 'p' THEN 'PRIMARY KEY' WHEN 'f' THEN 'FOREIGN KEY'
         WHEN 'u' THEN 'UNIQUE'      WHEN 'c' THEN 'CHECK'
         WHEN 'x' THEN 'EXCLUDE'     ELSE contype::text
       END AS kind,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, contype;

| section       | table_name                 | constraint_name                              | kind        | definition                                                                                                                                                                          |
| ------------- | -------------------------- | -------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3_constraints | app_logs                   | app_logs_level_check                         | CHECK       | CHECK ((level = ANY (ARRAY['info'::text, 'warn'::text, 'error'::text])))                                                                                                            |
| 3_constraints | app_logs                   | app_logs_pkey                                | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | booking_guests             | booking_guests_guest_type_check              | CHECK       | CHECK (((guest_type)::text = ANY ((ARRAY['adult'::character varying, 'child'::character varying, 'infant'::character varying])::text[])))                                           |
| 3_constraints | booking_guests             | booking_guests_gender_check                  | CHECK       | CHECK (((gender)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'OTHER'::character varying])::text[])))                                                        |
| 3_constraints | booking_guests             | booking_guests_booking_id_fkey               | FOREIGN KEY | FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE                                                                                                                  |
| 3_constraints | booking_guests             | booking_guests_pkey                          | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | bookings                   | bookings_status_check                        | CHECK       | CHECK (((status)::text = ANY ((ARRAY['confirmed'::character varying, 'checked_in'::character varying, 'checked_out'::character varying, 'cancelled'::character varying])::text[]))) |
| 3_constraints | bookings                   | bookings_dogs_count_check                    | CHECK       | CHECK ((dogs_count >= 0))                                                                                                                                                           |
| 3_constraints | bookings                   | bookings_guests_count_check                  | CHECK       | CHECK ((guests_count > 0))                                                                                                                                                          |
| 3_constraints | bookings                   | bookings_pitch_id_fkey                       | FOREIGN KEY | FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE                                                                                                                     |
| 3_constraints | bookings                   | bookings_customer_id_fkey                    | FOREIGN KEY | FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE                                                                                                                |
| 3_constraints | bookings                   | bookings_pkey                                | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | bookings                   | prevent_overbooking                          | EXCLUDE     | EXCLUDE USING gist (pitch_id WITH =, booking_period WITH &&) WHERE (((status)::text <> ALL ((ARRAY['cancelled'::character varying, 'checked_out'::character varying])::text[])))    |
| 3_constraints | customer_groups            | customer_groups_pkey                         | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | customer_groups            | customer_groups_name_key                     | UNIQUE      | UNIQUE (name)                                                                                                                                                                       |
| 3_constraints | customers                  | customers_gender_check                       | CHECK       | CHECK (((gender)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'Other'::character varying])::text[])))                                                        |
| 3_constraints | customers                  | customers_group_id_fkey                      | FOREIGN KEY | FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE SET NULL                                                                                                            |
| 3_constraints | customers                  | customers_pkey                               | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | group_bundles              | group_bundles_price_check                    | CHECK       | CHECK ((pitch_price >= (0)::numeric))                                                                                                                                               |
| 3_constraints | group_bundles              | group_bundles_nights_check                   | CHECK       | CHECK ((nights > 0))                                                                                                                                                                |
| 3_constraints | group_bundles              | group_bundles_season_id_fkey                 | FOREIGN KEY | FOREIGN KEY (season_id) REFERENCES pricing_seasons(id) ON DELETE CASCADE                                                                                                            |
| 3_constraints | group_bundles              | group_bundles_group_id_fkey                  | FOREIGN KEY | FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE CASCADE                                                                                                             |
| 3_constraints | group_bundles              | group_bundles_pkey                           | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | group_bundles              | unique_group_bundle_season_nights            | UNIQUE      | UNIQUE (group_id, season_id, nights)                                                                                                                                                |
| 3_constraints | group_season_configuration | group_season_configuration_group_id_fkey     | FOREIGN KEY | FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE CASCADE                                                                                                             |
| 3_constraints | group_season_configuration | group_season_configuration_season_id_fkey    | FOREIGN KEY | FOREIGN KEY (season_id) REFERENCES pricing_seasons(id) ON DELETE CASCADE                                                                                                            |
| 3_constraints | group_season_configuration | group_season_configuration_pkey              | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | group_season_configuration | group_season_config_unique                   | UNIQUE      | UNIQUE (group_id, season_id)                                                                                                                                                        |
| 3_constraints | pitches                    | pitches_type_check                           | CHECK       | CHECK (((type)::text = ANY ((ARRAY['piazzola'::character varying, 'tenda'::character varying])::text[])))                                                                           |
| 3_constraints | pitches                    | pitches_status_check                         | CHECK       | CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'maintenance'::character varying, 'blocked'::character varying])::text[])))                                    |
| 3_constraints | pitches                    | pitches_suffix_check                         | CHECK       | CHECK (((suffix)::text = ANY ((ARRAY[''::character varying, 'a'::character varying, 'b'::character varying])::text[])))                                                             |
| 3_constraints | pitches                    | pitches_pkey                                 | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | pitches                    | pitches_number_suffix_key                    | UNIQUE      | UNIQUE (number, suffix)                                                                                                                                                             |
| 3_constraints | pricing_seasons            | pricing_seasons_priority_check               | CHECK       | CHECK ((priority >= 0))                                                                                                                                                             |
| 3_constraints | pricing_seasons            | pricing_seasons_tenda_price_per_day_check    | CHECK       | CHECK ((tenda_price_per_day >= (0)::numeric))                                                                                                                                       |
| 3_constraints | pricing_seasons            | valid_date_range                             | CHECK       | CHECK ((end_date >= start_date))                                                                                                                                                    |
| 3_constraints | pricing_seasons            | pricing_seasons_piazzola_price_per_day_check | CHECK       | CHECK ((piazzola_price_per_day >= (0)::numeric))                                                                                                                                    |
| 3_constraints | pricing_seasons            | pricing_seasons_pkey                         | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | sectors                    | sectors_pkey                                 | PRIMARY KEY | PRIMARY KEY (id)                                                                                                                                                                    |
| 3_constraints | sectors                    | sectors_name_key                             | UNIQUE      | UNIQUE (name)                                                                                                                                                                       |

-- 4) INDEXES (exact CREATE INDEX; PK/unique-backing indexes included)
SELECT '4_indexes' AS section,
       tablename AS table_name,
       indexname AS index_name,
       indexdef  AS definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

| section   | table_name                 | index_name                        | definition                                                                                                                                                                                                                                                                             |
| --------- | -------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4_indexes | app_logs                   | app_logs_pkey                     | CREATE UNIQUE INDEX app_logs_pkey ON public.app_logs USING btree (id)                                                                                                                                                                                                                  |
| 4_indexes | app_logs                   | app_logs_timestamp_idx            | CREATE INDEX app_logs_timestamp_idx ON public.app_logs USING btree ("timestamp" DESC)                                                                                                                                                                                                  |
| 4_indexes | booking_guests             | booking_guests_pkey               | CREATE UNIQUE INDEX booking_guests_pkey ON public.booking_guests USING btree (id)                                                                                                                                                                                                      |
| 4_indexes | booking_guests             | idx_booking_guests_booking_id     | CREATE INDEX idx_booking_guests_booking_id ON public.booking_guests USING btree (booking_id)                                                                                                                                                                                           |
| 4_indexes | booking_guests             | idx_booking_guests_type           | CREATE INDEX idx_booking_guests_type ON public.booking_guests USING btree (guest_type)                                                                                                                                                                                                 |
| 4_indexes | bookings                   | bookings_pkey                     | CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id)                                                                                                                                                                                                                  |
| 4_indexes | bookings                   | idx_bookings_created_at_desc      | CREATE INDEX idx_bookings_created_at_desc ON public.bookings USING btree (created_at DESC)                                                                                                                                                                                             |
| 4_indexes | bookings                   | idx_bookings_customer_id          | CREATE INDEX idx_bookings_customer_id ON public.bookings USING btree (customer_id)                                                                                                                                                                                                     |
| 4_indexes | bookings                   | idx_bookings_dates                | CREATE INDEX idx_bookings_dates ON public.bookings USING btree (lower(booking_period), upper(booking_period)) WHERE ((status)::text = ANY ((ARRAY['confirmed'::character varying, 'checked_in'::character varying])::text[]))                                                          |
| 4_indexes | bookings                   | idx_bookings_period               | CREATE INDEX idx_bookings_period ON public.bookings USING gist (booking_period)                                                                                                                                                                                                        |
| 4_indexes | bookings                   | idx_bookings_period_bounds_status | CREATE INDEX idx_bookings_period_bounds_status ON public.bookings USING btree (lower(booking_period), upper(booking_period), status) WHERE ((status)::text = ANY ((ARRAY['confirmed'::character varying, 'checked_in'::character varying, 'checked_out'::character varying])::text[])) |
| 4_indexes | bookings                   | idx_bookings_pitch_id             | CREATE INDEX idx_bookings_pitch_id ON public.bookings USING btree (pitch_id) WHERE ((status)::text <> 'cancelled'::text)                                                                                                                                                               |
| 4_indexes | bookings                   | idx_bookings_status               | CREATE INDEX idx_bookings_status ON public.bookings USING btree (status)                                                                                                                                                                                                               |
| 4_indexes | bookings                   | prevent_overbooking               | CREATE INDEX prevent_overbooking ON public.bookings USING gist (pitch_id, booking_period) WHERE ((status)::text <> ALL ((ARRAY['cancelled'::character varying, 'checked_out'::character varying])::text[]))                                                                            |
| 4_indexes | customer_groups            | customer_groups_name_key          | CREATE UNIQUE INDEX customer_groups_name_key ON public.customer_groups USING btree (name)                                                                                                                                                                                              |
| 4_indexes | customer_groups            | customer_groups_pkey              | CREATE UNIQUE INDEX customer_groups_pkey ON public.customer_groups USING btree (id)                                                                                                                                                                                                    |
| 4_indexes | customers                  | customers_pkey                    | CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id)                                                                                                                                                                                                                |
| 4_indexes | customers                  | idx_customers_email               | CREATE INDEX idx_customers_email ON public.customers USING btree (email)                                                                                                                                                                                                               |
| 4_indexes | customers                  | idx_customers_group_id            | CREATE INDEX idx_customers_group_id ON public.customers USING btree (group_id)                                                                                                                                                                                                         |
| 4_indexes | customers                  | idx_customers_license_plate       | CREATE INDEX idx_customers_license_plate ON public.customers USING btree (license_plate)                                                                                                                                                                                               |
| 4_indexes | customers                  | idx_customers_phone               | CREATE INDEX idx_customers_phone ON public.customers USING btree (phone)                                                                                                                                                                                                               |
| 4_indexes | group_bundles              | group_bundles_pkey                | CREATE UNIQUE INDEX group_bundles_pkey ON public.group_bundles USING btree (id)                                                                                                                                                                                                        |
| 4_indexes | group_bundles              | unique_group_bundle_season_nights | CREATE UNIQUE INDEX unique_group_bundle_season_nights ON public.group_bundles USING btree (group_id, season_id, nights)                                                                                                                                                                |
| 4_indexes | group_season_configuration | group_season_config_unique        | CREATE UNIQUE INDEX group_season_config_unique ON public.group_season_configuration USING btree (group_id, season_id)                                                                                                                                                                  |
| 4_indexes | group_season_configuration | group_season_configuration_pkey   | CREATE UNIQUE INDEX group_season_configuration_pkey ON public.group_season_configuration USING btree (id)                                                                                                                                                                              |
| 4_indexes | pitches                    | idx_pitches_status                | CREATE INDEX idx_pitches_status ON public.pitches USING btree (status)                                                                                                                                                                                                                 |
| 4_indexes | pitches                    | idx_pitches_type                  | CREATE INDEX idx_pitches_type ON public.pitches USING btree (type)                                                                                                                                                                                                                     |
| 4_indexes | pitches                    | pitches_number_suffix_key         | CREATE UNIQUE INDEX pitches_number_suffix_key ON public.pitches USING btree (number, suffix)                                                                                                                                                                                           |
| 4_indexes | pitches                    | pitches_pkey                      | CREATE UNIQUE INDEX pitches_pkey ON public.pitches USING btree (id)                                                                                                                                                                                                                    |
| 4_indexes | pricing_seasons            | idx_pricing_seasons_date_priority | CREATE INDEX idx_pricing_seasons_date_priority ON public.pricing_seasons USING btree (start_date, end_date, priority DESC, is_active) WHERE (is_active = true)                                                                                                                         |
| 4_indexes | pricing_seasons            | idx_pricing_seasons_dates         | CREATE INDEX idx_pricing_seasons_dates ON public.pricing_seasons USING btree (start_date, end_date, is_active) WHERE (is_active = true)                                                                                                                                                |
| 4_indexes | pricing_seasons            | idx_pricing_seasons_priority      | CREATE INDEX idx_pricing_seasons_priority ON public.pricing_seasons USING btree (priority DESC) WHERE (is_active = true)                                                                                                                                                               |
| 4_indexes | pricing_seasons            | pricing_seasons_pkey              | CREATE UNIQUE INDEX pricing_seasons_pkey ON public.pricing_seasons USING btree (id)                                                                                                                                                                                                    |
| 4_indexes | sectors                    | sectors_name_key                  | CREATE UNIQUE INDEX sectors_name_key ON public.sectors USING btree (name)                                                                                                                                                                                                              |
| 4_indexes | sectors                    | sectors_pkey                      | CREATE UNIQUE INDEX sectors_pkey ON public.sectors USING btree (id)                                                                                                                                                                                                                    |

-- 5) FUNCTIONS (exact CREATE OR REPLACE FUNCTION ...)
SELECT '5_functions' AS section,
       p.proname AS function_name,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND p.prokind = 'f'
ORDER BY p.proname;

| section     | function_name            | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5_functions | cleanup_old_logs         | CREATE OR REPLACE FUNCTION public.cleanup_old_logs(days_to_keep integer DEFAULT 60)
 RETURNS TABLE(deleted_count bigint, freed_space_estimate text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  count_deleted BIGINT;
  size_before BIGINT;
  size_after BIGINT;
BEGIN
  -- Get size before
  SELECT pg_total_relation_size('app_logs') INTO size_before;
  
  -- Delete old logs
  DELETE FROM app_logs 
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS count_deleted = ROW_COUNT;
  
  -- Get size after (note: space is not immediately freed, requires VACUUM)
  SELECT pg_total_relation_size('app_logs') INTO size_after;
  
  RETURN QUERY
  SELECT 
    count_deleted,
    pg_size_pretty(size_before - size_after)::TEXT;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                          |
| 5_functions | count_arrivals_today     | CREATE OR REPLACE FUNCTION public.count_arrivals_today(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE lower(booking_period) = target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 5_functions | count_departures_today   | CREATE OR REPLACE FUNCTION public.count_departures_today(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE upper(booking_period) = target_date
        AND status IN ('checked_in', 'checked_out')
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5_functions | get_current_occupancy    | CREATE OR REPLACE FUNCTION public.get_current_occupancy(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.bookings
        WHERE booking_period @> target_date
        AND status IN ('confirmed', 'checked_in')
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 5_functions | get_dashboard_stats      | CREATE OR REPLACE FUNCTION public.get_dashboard_stats(target_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(arrivals_today integer, departures_today integer, current_occupancy integer, total_pitches integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT
      COUNT(*) FILTER (
        WHERE lower(booking_period) = target_date 
        AND status IN ('confirmed', 'checked_in')
      )::INTEGER AS arrivals,
      COUNT(*) FILTER (
        WHERE upper(booking_period) = target_date 
        AND status IN ('checked_in', 'checked_out')
      )::INTEGER AS departures,
      COUNT(*) FILTER (
        WHERE booking_period @> target_date 
        AND status IN ('confirmed', 'checked_in')
      )::INTEGER AS occupancy
    FROM public.bookings
  ),
  pitch_stats AS (
    SELECT COUNT(*)::INTEGER AS total
    FROM public.pitches
  )
  SELECT 
    bs.arrivals,
    bs.departures,
    bs.occupancy,
    ps.total
  FROM booking_stats bs
  CROSS JOIN pitch_stats ps;
END;
$function$
                                                                                                        |
| 5_functions | get_database_stats       | CREATE OR REPLACE FUNCTION public.get_database_stats()
 RETURNS TABLE(table_name text, row_count bigint, total_size text, table_size text, indexes_size text, total_size_bytes bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    (SELECT COUNT(*) FROM pg_catalog.pg_class c 
     JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace 
     WHERE c.relname = t.table_name AND n.nspname = 'public')::BIGINT as row_count,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass))::TEXT as total_size,
    pg_size_pretty(pg_relation_size(quote_ident(t.table_name)::regclass))::TEXT as table_size,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass) - 
                   pg_relation_size(quote_ident(t.table_name)::regclass))::TEXT as indexes_size,
    pg_total_relation_size(quote_ident(t.table_name)::regclass)::BIGINT as total_size_bytes
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size(quote_ident(t.table_name)::regclass) DESC;
END;
$function$
 |
| 5_functions | get_database_summary     | CREATE OR REPLACE FUNCTION public.get_database_summary()
 RETURNS TABLE(total_size_bytes bigint, total_size_pretty text, total_tables integer, total_rows bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(pg_total_relation_size(quote_ident(t.table_name)::regclass))::BIGINT as total_size_bytes,
    pg_size_pretty(SUM(pg_total_relation_size(quote_ident(t.table_name)::regclass)))::TEXT as total_size_pretty,
    COUNT(*)::INTEGER as total_tables,
    0::BIGINT as total_rows -- Placeholder, will be calculated separately for performance
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE';
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 5_functions | get_db_stats             | CREATE OR REPLACE FUNCTION public.get_db_stats()
 RETURNS TABLE(total_bookings bigint, total_customers bigint, total_pitches bigint, total_guests bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.bookings) AS total_bookings,
    (SELECT COUNT(*) FROM public.customers) AS total_customers,
    (SELECT COUNT(*) FROM public.pitches) AS total_pitches,
    (SELECT COUNT(*) FROM public.booking_guests) AS total_guests;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5_functions | get_performance_metrics  | CREATE OR REPLACE FUNCTION public.get_performance_metrics()
 RETURNS TABLE(active_connections integer, cache_hit_ratio numeric, avg_query_time_ms numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER as active_connections,
    ROUND(
      (SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0) * 100)::NUMERIC, 
      2
    ) as cache_hit_ratio,
    0::NUMERIC as avg_query_time_ms -- Placeholder (requires pg_stat_statements extension)
  FROM pg_stat_database
  WHERE datname = current_database();
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 5_functions | get_price_for_date       | CREATE OR REPLACE FUNCTION public.get_price_for_date(search_date date)
 RETURNS TABLE(season_id uuid, season_name character varying, piazzola_price numeric, tenda_price numeric, person_price numeric, child_price numeric, dog_price numeric, car_price numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.piazzola_price_per_day,
    ps.tenda_price_per_day,
    ps.person_price_per_day,
    ps.child_price_per_day,
    ps.dog_price_per_day,
    ps.car_price_per_day
  FROM public.pricing_seasons ps
  WHERE ps.is_active = true
    AND search_date >= ps.start_date
    AND search_date <= ps.end_date
  ORDER BY ps.priority DESC
  LIMIT 1;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 5_functions | get_recent_logs          | CREATE OR REPLACE FUNCTION public.get_recent_logs(limit_count integer DEFAULT 100, log_level text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, level character varying, message text, metadata jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.level,
    l.message,
    l.metadata,
    l.created_at
  FROM app_logs l
  WHERE (log_level IS NULL OR l.level = log_level)
  ORDER BY l.created_at DESC
  LIMIT limit_count;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 5_functions | get_storage_stats        | CREATE OR REPLACE FUNCTION public.get_storage_stats()
 RETURNS TABLE(table_name text, total_size_bytes bigint, table_size_bytes bigint, indexes_size_bytes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY SELECT t.tablename::TEXT, pg_total_relation_size(quote_ident(t.tablename)::regclass)::BIGINT, pg_relation_size(quote_ident(t.tablename)::regclass)::BIGINT, (pg_total_relation_size(quote_ident(t.tablename)::regclass) - pg_relation_size(quote_ident(t.tablename)::regclass))::BIGINT
  FROM pg_tables t WHERE t.schemaname = 'public';
END; $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 5_functions | update_updated_at_column | CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5_functions | vacuum_analyze_all       | CREATE OR REPLACE FUNCTION public.vacuum_analyze_all()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  table_record RECORD;
  result TEXT := '';
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'VACUUM ANALYZE ' || quote_ident(table_record.tablename);
    result := result || table_record.tablename || ', ';
  END LOOP;
  
  RETURN 'Vacuumed tables: ' || TRIM(TRAILING ', ' FROM result);
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

-- 6) TRIGGERS (exact CREATE TRIGGER ...)
SELECT '6_triggers' AS section,
       c.relname AS table_name,
       t.tgname  AS trigger_name,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relnamespace = 'public'::regnamespace
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

| section    | table_name                 | trigger_name                          | definition                                                                                                                                                       |
| ---------- | -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6_triggers | booking_guests             | update_booking_guests_updated_at      | CREATE TRIGGER update_booking_guests_updated_at BEFORE UPDATE ON public.booking_guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                  |
| 6_triggers | bookings                   | update_bookings_updated_at            | CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                              |
| 6_triggers | customer_groups            | update_customer_groups_updated_at     | CREATE TRIGGER update_customer_groups_updated_at BEFORE UPDATE ON public.customer_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                |
| 6_triggers | customers                  | update_customers_updated_at           | CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                            |
| 6_triggers | group_bundles              | update_group_bundles_updated_at       | CREATE TRIGGER update_group_bundles_updated_at BEFORE UPDATE ON public.group_bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                    |
| 6_triggers | group_season_configuration | update_group_season_config_updated_at | CREATE TRIGGER update_group_season_config_updated_at BEFORE UPDATE ON public.group_season_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column() |
| 6_triggers | pitches                    | update_pitches_updated_at             | CREATE TRIGGER update_pitches_updated_at BEFORE UPDATE ON public.pitches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                                |
| 6_triggers | pricing_seasons            | update_pricing_seasons_updated_at     | CREATE TRIGGER update_pricing_seasons_updated_at BEFORE UPDATE ON public.pricing_seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                |
| 6_triggers | sectors                    | update_sectors_updated_at             | CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()                                |


-- 7) RLS — enabled flag per table
SELECT '7_rls_enabled' AS section,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
ORDER BY c.relname;

| section       | table_name                 | rls_enabled | rls_forced |
| ------------- | -------------------------- | ----------- | ---------- |
| 7_rls_enabled | app_logs                   | true        | false      |
| 7_rls_enabled | booking_guests             | true        | false      |
| 7_rls_enabled | bookings                   | true        | false      |
| 7_rls_enabled | customer_groups            | true        | false      |
| 7_rls_enabled | customers                  | true        | false      |
| 7_rls_enabled | group_bundles              | true        | false      |
| 7_rls_enabled | group_season_configuration | true        | false      |
| 7_rls_enabled | pitches                    | true        | false      |
| 7_rls_enabled | pricing_seasons            | true        | false      |
| 7_rls_enabled | sectors                    | true        | false      |

-- 8) RLS — policies (I rebuild CREATE POLICY from these fields)
SELECT '8_policies' AS section,
       tablename AS table_name,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

| section    | table_name                 | policyname                                                      | permissive | roles           | cmd    | qual | with_check |
| ---------- | -------------------------- | --------------------------------------------------------------- | ---------- | --------------- | ------ | ---- | ---------- |
| 8_policies | app_logs                   | Allow service role to insert logs                               | PERMISSIVE | {service_role}  | INSERT | null | true       |
| 8_policies | app_logs                   | Enable read access for authenticated users                      | PERMISSIVE | {authenticated} | SELECT | true | null       |
| 8_policies | booking_guests             | Authenticated users have full access to booking_guests          | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | bookings                   | Authenticated users have full access to bookings                | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | customer_groups            | Enable all for authenticated users on customer_groups           | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | customers                  | Authenticated users have full access to customers               | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | group_season_configuration | Enable all for authenticated users on group_season_configuratio | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | pitches                    | Authenticated users have full access to pitches                 | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | pricing_seasons            | Authenticated users have full access to pricing_seasons         | PERMISSIVE | {authenticated} | ALL    | true | true       |
| 8_policies | sectors                    | Authenticated users have full access to sectors                 | PERMISSIVE | {authenticated} | ALL    | true | true       |

-- 9) SEQUENCES (usually none — UUID PKs — but capture any SERIAL/identity)
SELECT '9_sequences' AS section,
       sequence_name,
       data_type,
       start_value,
       increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

Success. No rows returned