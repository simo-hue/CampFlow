-- Create a table for application logs
create table if not exists app_logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  meta jsonb, -- For storing extra details like stack trace, user_id, path, etc.
  environment text default 'development'
);

-- Enable RLS to secure the table
alter table app_logs enable row level security;

-- Policy: Allow the service role (server-side) to insert logs
-- We will use the service_role key or authenticated server actions to write logs.
create policy "Allow service role to insert logs"
  on app_logs
  for insert
  to service_role
  with check (true);

-- Policy: Allow authenticated users (specifically admins) to view logs
-- For now, we'll allow authenticated users to read, but in the app we'll gate the page.
-- Ideally, you'd check a role, but for this simple "password protected page" setup,
-- we function primarily on the server-side with service_role or admin client.
create policy "Enable read access for authenticated users"
  on app_logs
  for select
  to authenticated
  using (true);

-- Create an index on timestamp for faster ordering/filtering
create index if not exists app_logs_timestamp_idx on app_logs (timestamp desc);
