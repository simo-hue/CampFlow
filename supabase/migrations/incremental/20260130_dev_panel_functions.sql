-- =====================================================
-- Developer Panel Functions
-- =====================================================
-- Created: 2026-01-30
-- Purpose: Provide database statistics and maintenance functions for dev panel
-- =====================================================

-- =====================================================
-- FUNCTION: Get Database Size Statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT,
  table_size TEXT,
  indexes_size TEXT,
  total_size_bytes BIGINT
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_database_stats IS 'Returns detailed storage statistics for all tables including row counts, sizes, and index overhead';

-- =====================================================
-- FUNCTION: Get Overall Database Summary
-- =====================================================
CREATE OR REPLACE FUNCTION get_database_summary()
RETURNS TABLE (
  total_size_bytes BIGINT,
  total_size_pretty TEXT,
  total_tables INTEGER,
  total_rows BIGINT
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_database_summary IS 'Returns overall database summary statistics';

-- =====================================================
-- FUNCTION: Cleanup Old Logs
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 60)
RETURNS TABLE (
  deleted_count BIGINT,
  freed_space_estimate TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_logs IS 'Deletes logs older than specified days (default 60) and returns count of deleted records';

-- =====================================================
-- FUNCTION: Get Recent Logs
-- =====================================================
CREATE OR REPLACE FUNCTION get_recent_logs(
  limit_count INTEGER DEFAULT 100,
  log_level TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  level VARCHAR(10),
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_recent_logs IS 'Returns recent logs with optional level filter';

-- =====================================================
-- FUNCTION: Get Performance Metrics
-- =====================================================
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE (
  active_connections INTEGER,
  cache_hit_ratio NUMERIC,
  avg_query_time_ms NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_performance_metrics IS 'Returns basic performance metrics including connections and cache hit ratio';

-- =====================================================
-- FUNCTION: Vacuum Analyze All Tables
-- =====================================================
CREATE OR REPLACE FUNCTION vacuum_analyze_all()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION vacuum_analyze_all IS 'Runs VACUUM ANALYZE on all public tables to reclaim space and update statistics';
