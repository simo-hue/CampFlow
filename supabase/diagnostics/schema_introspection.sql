-- =====================================================
-- SCHEMA INTROSPECTION (READ-ONLY) — for H-2/H-3 regen
-- =====================================================
-- Run EACH numbered section in the Supabase SQL Editor and paste the output
-- back (labelled with its section number). Read-only: nothing is modified.
-- Most sections return ready-to-use DDL via pg_get_*def().
-- =====================================================


-- 1) EXTENSIONS (+ schema)
SELECT '1_extensions' AS section,
       e.extname AS extension,
       n.nspname AS schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;


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


-- 4) INDEXES (exact CREATE INDEX; PK/unique-backing indexes included)
SELECT '4_indexes' AS section,
       tablename AS table_name,
       indexname AS index_name,
       indexdef  AS definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- 5) FUNCTIONS (exact CREATE OR REPLACE FUNCTION ...)
SELECT '5_functions' AS section,
       p.proname AS function_name,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND p.prokind = 'f'
ORDER BY p.proname;


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


-- 7) RLS — enabled flag per table
SELECT '7_rls_enabled' AS section,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
ORDER BY c.relname;


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


-- 9) SEQUENCES (usually none — UUID PKs — but capture any SERIAL/identity)
SELECT '9_sequences' AS section,
       sequence_name,
       data_type,
       start_value,
       increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
