-- =====================================================
-- MINIMAL Storage Statistics Function
-- Only returns accurate table sizes using PostgreSQL native functions
-- =====================================================

CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  table_name TEXT,
  total_size_bytes BIGINT,
  table_size_bytes BIGINT,
  indexes_size_bytes BIGINT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    pg_total_relation_size(quote_ident(t.tablename)::regclass)::BIGINT as total_bytes,
    pg_relation_size(quote_ident(t.tablename)::regclass)::BIGINT as table_bytes,
    (pg_total_relation_size(quote_ident(t.tablename)::regclass) - 
     pg_relation_size(quote_ident(t.tablename)::regclass))::BIGINT as index_bytes
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY pg_total_relation_size(quote_ident(t.tablename)::regclass) DESC;
END;
$$;

COMMENT ON FUNCTION get_storage_stats IS 'Returns accurate storage statistics for all tables using PostgreSQL native size functions';
