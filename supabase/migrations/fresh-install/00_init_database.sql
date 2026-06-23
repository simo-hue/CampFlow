-- =====================================================
-- CampFlow Database Setup — Complete Initialization
-- =====================================================
-- Version: 2.0  (regenerated 2026-06-23 from the LIVE database)
-- Purpose: Single authoritative file to initialize a fresh Supabase project so
--          it matches production. Run the whole file once in the SQL Editor.
--
-- This replaces the previous stale v1.0. It was rebuilt from a live schema
-- introspection (see supabase/diagnostics/schema_introspection.sql), so the
-- column set, constraints, indexes, functions, triggers and RLS match what the
-- app actually expects.
--
-- KNOWN SMELLS preserved faithfully from production and flagged with FIXME:
--   - pitches.sector_id is VARCHAR(50), not a UUID FK to sectors.
--   - booking_guests.gender CHECK uses 'OTHER' while customers.gender uses 'Other'.
-- Two live-but-dead functions (cleanup_old_logs, get_recent_logs) were omitted
-- because they reference removed app_logs columns; see the note near the end.
-- =====================================================


-- =====================================================
-- STEP 1: EXTENSIONS
-- =====================================================
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto   SCHEMA extensions;
-- btree_gist is REQUIRED for the anti-overbooking EXCLUDE constraint
-- (combines `pitch_id WITH =` and `booking_period WITH &&` in one GiST index).
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Ensure the btree_gist operator classes (used by the EXCLUDE constraint below)
-- are resolvable in this session regardless of the role's default search_path.
SET search_path TO public, extensions;


-- =====================================================
-- STEP 2: TABLES  (columns + inline PK/CHECK/UNIQUE/DEFAULT)
-- Cross-table FKs and the EXCLUDE constraint are added in STEP 3.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sectors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_groups (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL UNIQUE,
  description        TEXT,
  color              TEXT DEFAULT '#3b82f6',
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  force_manual_price BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.pricing_seasons (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   VARCHAR(100) NOT NULL,
  description            TEXT,
  start_date             DATE NOT NULL,
  end_date               DATE NOT NULL,
  piazzola_price_per_day NUMERIC(10,2) NOT NULL CHECK (piazzola_price_per_day >= 0),
  tenda_price_per_day    NUMERIC(10,2) NOT NULL CHECK (tenda_price_per_day >= 0),
  priority               INTEGER NOT NULL DEFAULT 0 CHECK (priority >= 0),
  color                  VARCHAR(7) DEFAULT '#3b82f6',
  is_active              BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  person_price_per_day   NUMERIC(10,2) NOT NULL DEFAULT 0,
  child_price_per_day    NUMERIC(10,2) NOT NULL DEFAULT 0,
  dog_price_per_day      NUMERIC(10,2) NOT NULL DEFAULT 0,
  car_price_per_day      NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_recurring           BOOLEAN DEFAULT true,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.pitches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number     VARCHAR(10) NOT NULL,
  suffix     VARCHAR(1)  NOT NULL DEFAULT '' CHECK (suffix IN ('', 'a', 'b')),
  type       VARCHAR(50) NOT NULL CHECK (type IN ('piazzola', 'tenda')),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- FIXME: sector_id holds a sectors.id UUID but is typed VARCHAR(50) with no FK.
  -- A future migration should convert this to UUID REFERENCES sectors(id).
  sector_id  VARCHAR(50),
  CONSTRAINT pitches_number_suffix_key UNIQUE (number, suffix)
);

CREATE TABLE IF NOT EXISTS public.customers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  VARCHAR(255),
  phone                  VARCHAR(50) NOT NULL,
  address                TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name             VARCHAR(100) NOT NULL,
  last_name              VARCHAR(100) NOT NULL,
  birth_date             DATE,
  birth_country          VARCHAR(100),
  birth_city             VARCHAR(100),
  birth_province         VARCHAR(50),
  citizenship            VARCHAR(100),
  gender                 VARCHAR(10) CHECK (gender IN ('M', 'F', 'Other')),
  residence_country      VARCHAR(100),
  residence_province     VARCHAR(50),
  residence_city         VARCHAR(100),
  residence_zip          VARCHAR(20),
  document_type          VARCHAR(50),
  document_number        VARCHAR(50),
  document_issue_country VARCHAR(100),
  document_issue_city    VARCHAR(100),
  document_issue_date    DATE,
  document_issuer        VARCHAR(100),
  license_plate          VARCHAR(20),
  group_id               UUID,
  personal_id_code       VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id        UUID NOT NULL,
  customer_id     UUID NOT NULL,
  booking_period  DATERANGE NOT NULL,
  guests_count    INTEGER NOT NULL CHECK (guests_count > 0),
  total_price     NUMERIC(10,2) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  dogs_count      INTEGER NOT NULL DEFAULT 0 CHECK (dogs_count >= 0),
  questura_sent   BOOLEAN NOT NULL DEFAULT false,
  children_count  INTEGER DEFAULT 0,
  cars_count      INTEGER DEFAULT 0,
  is_manual_price BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.booking_guests (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id             UUID NOT NULL,
  full_name              VARCHAR(255),
  birth_date             DATE,
  birth_place            VARCHAR(255),
  address                TEXT,
  document_type          VARCHAR(50),
  document_number        VARCHAR(100),
  nationality            VARCHAR(100),
  guest_type             VARCHAR(20) NOT NULL DEFAULT 'adult'
                           CHECK (guest_type IN ('adult', 'child', 'infant')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name             VARCHAR(255),
  last_name              VARCHAR(255),
  -- FIXME: 'OTHER' here is inconsistent with customers.gender ('Other') and the
  -- TS type. Consider normalizing to 'Other' in a future migration.
  gender                 VARCHAR(10) CHECK (gender IN ('M', 'F', 'OTHER')),
  citizenship            VARCHAR(100),
  birth_country          VARCHAR(100),
  birth_province         VARCHAR(100),
  birth_city             VARCHAR(100),
  is_head_of_family      BOOLEAN DEFAULT false,
  residence_country      VARCHAR(100),
  residence_province     VARCHAR(10),
  residence_city         VARCHAR(150),
  residence_zip          VARCHAR(10),
  document_issue_date    DATE,
  document_issuer        VARCHAR(150),
  document_issue_city    VARCHAR(150),
  document_issue_country VARCHAR(100),
  license_plate          VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS public.group_season_configuration (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            UUID NOT NULL,
  season_id           UUID NOT NULL,
  discount_percentage NUMERIC(5,2),
  custom_rates        JSONB,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT group_season_config_unique UNIQUE (group_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.group_bundles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL,
  nights      INTEGER NOT NULL CHECK (nights > 0),
  pitch_price NUMERIC(10,2) NOT NULL CHECK (pitch_price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  unit_prices JSONB DEFAULT '{}'::jsonb,
  season_id   UUID,
  CONSTRAINT unique_group_bundle_season_nights UNIQUE (group_id, season_id, nights)
);

CREATE TABLE IF NOT EXISTS public.app_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  level       TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message     TEXT NOT NULL,
  meta        JSONB,
  environment TEXT DEFAULT 'development'
);


-- =====================================================
-- STEP 3: FOREIGN KEYS + ANTI-OVERBOOKING EXCLUDE
-- (added after all tables exist)
-- =====================================================
ALTER TABLE public.customers
  ADD CONSTRAINT customers_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.customer_groups(id) ON DELETE SET NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_pitch_id_fkey
  FOREIGN KEY (pitch_id) REFERENCES public.pitches(id) ON DELETE CASCADE;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE public.booking_guests
  ADD CONSTRAINT booking_guests_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.group_season_configuration
  ADD CONSTRAINT group_season_configuration_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.customer_groups(id) ON DELETE CASCADE;
ALTER TABLE public.group_season_configuration
  ADD CONSTRAINT group_season_configuration_season_id_fkey
  FOREIGN KEY (season_id) REFERENCES public.pricing_seasons(id) ON DELETE CASCADE;

ALTER TABLE public.group_bundles
  ADD CONSTRAINT group_bundles_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.customer_groups(id) ON DELETE CASCADE;
ALTER TABLE public.group_bundles
  ADD CONSTRAINT group_bundles_season_id_fkey
  FOREIGN KEY (season_id) REFERENCES public.pricing_seasons(id) ON DELETE CASCADE;

-- Physically prevent overlapping bookings on the same pitch (the core guarantee).
ALTER TABLE public.bookings
  ADD CONSTRAINT prevent_overbooking
  EXCLUDE USING gist (pitch_id WITH =, booking_period WITH &&)
  WHERE (status::text <> ALL (ARRAY['cancelled', 'checked_out']));


-- =====================================================
-- STEP 4: INDEXES (non-constraint-backing)
-- =====================================================
CREATE INDEX IF NOT EXISTS app_logs_timestamp_idx ON public.app_logs USING btree ("timestamp" DESC);

CREATE INDEX IF NOT EXISTS idx_booking_guests_booking_id ON public.booking_guests USING btree (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_type       ON public.booking_guests USING btree (guest_type);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at_desc ON public.bookings USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id     ON public.bookings USING btree (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings USING btree (lower(booking_period), upper(booking_period))
  WHERE (status::text = ANY (ARRAY['confirmed','checked_in']));
CREATE INDEX IF NOT EXISTS idx_bookings_period ON public.bookings USING gist (booking_period);
CREATE INDEX IF NOT EXISTS idx_bookings_period_bounds_status ON public.bookings USING btree (lower(booking_period), upper(booking_period), status)
  WHERE (status::text = ANY (ARRAY['confirmed','checked_in','checked_out']));
CREATE INDEX IF NOT EXISTS idx_bookings_pitch_id ON public.bookings USING btree (pitch_id)
  WHERE (status::text <> 'cancelled');
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings USING btree (status);

CREATE INDEX IF NOT EXISTS idx_customers_email         ON public.customers USING btree (email);
CREATE INDEX IF NOT EXISTS idx_customers_group_id      ON public.customers USING btree (group_id);
CREATE INDEX IF NOT EXISTS idx_customers_license_plate ON public.customers USING btree (license_plate);
CREATE INDEX IF NOT EXISTS idx_customers_phone         ON public.customers USING btree (phone);

CREATE INDEX IF NOT EXISTS idx_pitches_status ON public.pitches USING btree (status);
CREATE INDEX IF NOT EXISTS idx_pitches_type   ON public.pitches USING btree (type);

CREATE INDEX IF NOT EXISTS idx_pricing_seasons_date_priority ON public.pricing_seasons USING btree (start_date, end_date, priority DESC, is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_pricing_seasons_dates         ON public.pricing_seasons USING btree (start_date, end_date, is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_pricing_seasons_priority      ON public.pricing_seasons USING btree (priority DESC) WHERE (is_active = true);


-- =====================================================
-- STEP 5: TRIGGER FUNCTION + TRIGGERS (auto updated_at)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_booking_guests_updated_at      BEFORE UPDATE ON public.booking_guests             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at            BEFORE UPDATE ON public.bookings                   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_groups_updated_at     BEFORE UPDATE ON public.customer_groups            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at           BEFORE UPDATE ON public.customers                  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_bundles_updated_at       BEFORE UPDATE ON public.group_bundles              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_season_config_updated_at BEFORE UPDATE ON public.group_season_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitches_updated_at             BEFORE UPDATE ON public.pitches                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_seasons_updated_at     BEFORE UPDATE ON public.pricing_seasons            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at             BEFORE UPDATE ON public.sectors                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- STEP 6: APPLICATION / DASHBOARD FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION public.count_arrivals_today(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.bookings
          WHERE lower(booking_period) = target_date AND status IN ('confirmed', 'checked_in'));
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_departures_today(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.bookings
          WHERE upper(booking_period) = target_date AND status IN ('checked_in', 'checked_out'));
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_occupancy(target_date date DEFAULT CURRENT_DATE)
 RETURNS integer LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.bookings
          WHERE booking_period @> target_date AND status IN ('confirmed', 'checked_in'));
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(target_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(arrivals_today integer, departures_today integer, current_occupancy integer, total_pitches integer)
 LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE lower(booking_period) = target_date AND status IN ('confirmed', 'checked_in'))::INTEGER AS arrivals,
      COUNT(*) FILTER (WHERE upper(booking_period) = target_date AND status IN ('checked_in', 'checked_out'))::INTEGER AS departures,
      COUNT(*) FILTER (WHERE booking_period @> target_date AND status IN ('confirmed', 'checked_in'))::INTEGER AS occupancy
    FROM public.bookings
  ),
  pitch_stats AS (SELECT COUNT(*)::INTEGER AS total FROM public.pitches)
  SELECT bs.arrivals, bs.departures, bs.occupancy, ps.total
  FROM booking_stats bs CROSS JOIN pitch_stats ps;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_db_stats()
 RETURNS TABLE(total_bookings bigint, total_customers bigint, total_pitches bigint, total_guests bigint)
 LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT (SELECT COUNT(*) FROM public.bookings),
         (SELECT COUNT(*) FROM public.customers),
         (SELECT COUNT(*) FROM public.pitches),
         (SELECT COUNT(*) FROM public.booking_guests);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_price_for_date(search_date date)
 RETURNS TABLE(season_id uuid, season_name character varying, piazzola_price numeric, tenda_price numeric,
               person_price numeric, child_price numeric, dog_price numeric, car_price numeric)
 LANGUAGE plpgsql STABLE SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT ps.id, ps.name, ps.piazzola_price_per_day, ps.tenda_price_per_day, ps.person_price_per_day,
         ps.child_price_per_day, ps.dog_price_per_day, ps.car_price_per_day
  FROM public.pricing_seasons ps
  WHERE ps.is_active = true AND search_date >= ps.start_date AND search_date <= ps.end_date
  ORDER BY ps.priority DESC LIMIT 1;
END;
$function$;

-- --- sys-monitor / dev helpers (SECURITY DEFINER) ---
CREATE OR REPLACE FUNCTION public.get_database_stats()
 RETURNS TABLE(table_name text, row_count bigint, total_size text, table_size text, indexes_size text, total_size_bytes bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT t.table_name::TEXT,
    (SELECT COUNT(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relname = t.table_name AND n.nspname = 'public')::BIGINT,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass))::TEXT,
    pg_size_pretty(pg_relation_size(quote_ident(t.table_name)::regclass))::TEXT,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass) - pg_relation_size(quote_ident(t.table_name)::regclass))::TEXT,
    pg_total_relation_size(quote_ident(t.table_name)::regclass)::BIGINT
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size(quote_ident(t.table_name)::regclass) DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_database_summary()
 RETURNS TABLE(total_size_bytes bigint, total_size_pretty text, total_tables integer, total_rows bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT SUM(pg_total_relation_size(quote_ident(t.table_name)::regclass))::BIGINT,
         pg_size_pretty(SUM(pg_total_relation_size(quote_ident(t.table_name)::regclass)))::TEXT,
         COUNT(*)::INTEGER, 0::BIGINT
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE';
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_performance_metrics()
 RETURNS TABLE(active_connections integer, cache_hit_ratio numeric, avg_query_time_ms numeric)
 LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER,
         ROUND((SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0) * 100)::NUMERIC, 2),
         0::NUMERIC
  FROM pg_stat_database WHERE datname = current_database();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_storage_stats()
 RETURNS TABLE(table_name text, total_size_bytes bigint, table_size_bytes bigint, indexes_size_bytes bigint)
 LANGUAGE plpgsql SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY SELECT t.tablename::TEXT,
    pg_total_relation_size(quote_ident(t.tablename)::regclass)::BIGINT,
    pg_relation_size(quote_ident(t.tablename)::regclass)::BIGINT,
    (pg_total_relation_size(quote_ident(t.tablename)::regclass) - pg_relation_size(quote_ident(t.tablename)::regclass))::BIGINT
  FROM pg_tables t WHERE t.schemaname = 'public';
END;
$function$;

CREATE OR REPLACE FUNCTION public.vacuum_analyze_all()
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER
AS $function$
DECLARE table_record RECORD; result TEXT := '';
BEGIN
  FOR table_record IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'VACUUM ANALYZE ' || quote_ident(table_record.tablename);
    result := result || table_record.tablename || ', ';
  END LOOP;
  RETURN 'Vacuumed tables: ' || TRIM(TRAILING ', ' FROM result);
END;
$function$;

-- NOTE: the live DB also has cleanup_old_logs() and get_recent_logs(), but they
-- reference app_logs.created_at / app_logs.metadata which DO NOT EXIST (the table
-- uses `timestamp` and `meta`). They are unused by the app and were intentionally
-- OMITTED here. Recommend DROP FUNCTION on them in production too.


-- =====================================================
-- STEP 7: ROW LEVEL SECURITY
-- =====================================================
-- The app uses the service-role key server-side (bypasses RLS). These policies
-- target `authenticated` only, so anon has no access (deny-by-default). Do NOT
-- add `public`/anon policies (that was the C-3 vulnerability).
ALTER TABLE public.sectors                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_seasons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_guests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_season_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_bundles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_logs                   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.sectors                    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.customer_groups            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.pricing_seasons            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.pitches                    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.customers                  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.bookings                   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.booking_guests             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.group_season_configuration FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- group_bundles had no policy in production (its only policy was the dropped
-- public one); added here for consistency with its sibling tables.
CREATE POLICY "Authenticated full access" ON public.group_bundles              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read access" ON public.app_logs                   FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert logs" ON public.app_logs                FOR INSERT TO service_role WITH CHECK (true);


-- =====================================================
-- STEP 8: SEED DATA (optional but recommended)
-- A default recurring season is needed or pricing resolves to 0.
-- =====================================================
INSERT INTO public.pricing_seasons
  (name, description, start_date, end_date, piazzola_price_per_day, tenda_price_per_day,
   person_price_per_day, child_price_per_day, dog_price_per_day, car_price_per_day, priority, color, is_recurring)
VALUES
  ('Bassa Stagione (Default)', 'Tariffa di base per i periodi non coperti da altre stagioni',
   '2020-01-01', '2050-12-31', 15.00, 12.00, 8.00, 5.00, 3.00, 3.00, 0, '#94a3b8', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.sectors (name) VALUES ('Settore 1'), ('Settore 2'), ('Settore 3'), ('Settore 4')
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- VERIFICATION
-- =====================================================
-- Tables (expect 10):
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
-- Anti-overbooking constraint present:
SELECT conname FROM pg_constraint WHERE conname = 'prevent_overbooking';
-- RLS on every table:
SELECT relname, relrowsecurity FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' ORDER BY relname;
