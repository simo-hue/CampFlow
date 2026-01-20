create or replace function get_db_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_size bigint;
  customer_count integer;
  booking_count integer;
  active_monitor_log_count integer;
  pitch_count integer;
begin
  -- Get DB Size (approximate)
  select pg_database_size(current_database()) into total_size;
  
  -- Get Counts
  select count(*) from customers into customer_count;
  select count(*) from bookings into booking_count;
  select count(*) from app_logs into active_monitor_log_count;
  select count(*) from pitches into pitch_count;
  
  return json_build_object(
    'size_bytes', total_size,
    'customers', customer_count,
    'bookings', booking_count,
    'logs', active_monitor_log_count,
    'pitches', pitch_count
  );
end;
$$;
