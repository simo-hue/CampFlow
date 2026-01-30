# CampFlow Database Setup Guide

Complete guide for initializing the CampFlow database on a fresh Supabase project.

---

## 🚀 Quick Start (Recommended)

For a **fresh database setup**, use the consolidated initialization script:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize (~2 minutes)

### Step 2: Run Initialization Script
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of **`00_init_database.sql`**
3. Paste and execute
4. Verify completion with the verification queries (included at the end of the script)

### Step 3: Configure Authentication
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Step 4: Set Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
```

Find these values in: **Supabase Dashboard** → **Settings** → **API**

---

## 📋 What Gets Created

### Core Tables
- `sectors` - Campsite organization (Settore 1, 2, 3, etc.)
- `pitches` - Individual campsite spots (piazzole/tende)
- `customers` - Customer records
- `customer_groups` - Pricing tiers (VIP, Friends, etc.)
- `bookings` - Reservations with date ranges
- `booking_guests` - Individual guest details for check-in
- `pricing_seasons` - Seasonal pricing configuration
- `group_season_configuration` - Custom group pricing per season
- `group_bundles` - Package deals (e.g., 3 nights for €50)
- `app_logs` - System monitoring logs

### Features Included
✅ **Anti-Overbooking**: GIST exclusion constraint prevents double-booking  
✅ **Row Level Security**: All tables protected (authenticated users only)  
✅ **Function Security**: All functions hardened with `search_path = ''`  
✅ **Auto-Timestamps**: Automatic `updated_at` tracking  
✅ **Dashboard Functions**: Pre-built statistics queries  
✅ **Performance Indexes**: Optimized for common queries  
✅ **Default Seed Data**: Base pricing season included  

---

## 🔧 Alternative: Incremental Migration

If you prefer **incremental execution** or need to **update an existing database**:

### Core Setup (Execute in order)
1. `01_extensions.sql` - PostgreSQL extensions
2. `02_tables.sql` - Core table structure
3. `03_indexes.sql` - Performance indexes
4. `04_triggers.sql` - Auto-update triggers
5. `05_functions.sql` - Dashboard functions
6. `06_seed_data.sql` - Default sectors & pitches
7. `07_rls.sql` - Row Level Security policies

### Feature Enhancements (As needed)
- `08_enhance_guest_management.sql` - Extended guest fields
- `09_pricing_seasons.sql` - Seasonal pricing system
- `10_update_customers_schema.sql` - Customer groups
- `20260127000000_customer_groups.sql` - Group pricing
- `20260129150000_group_bundles.sql` - Bundle packages
- `20260120104000_create_logs_table.sql` - System logging

### Security Hardening (Important)
- `fix_function_security.sql` - Add search_path to all functions
- `fix_extension_schema.sql` - Move extensions to dedicated schema
- `rlsLogged.sql` - Complete RLS coverage

---

## ✅ Verification Checklist

After running `00_init_database.sql`, verify:

### 1. Tables Created
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: 10 tables
```

### 2. RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All tables should show: rowsecurity = true
```

### 3. Functions Secured
```sql
SELECT proname, 
  COALESCE((SELECT setting FROM unnest(proconfig) setting WHERE setting LIKE 'search_path=%'), 'NOT SET') 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND prokind = 'f';
-- All should show: search_path=""
```

### 4. Extensions in Correct Schema
```sql
SELECT extname, nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname IN ('uuid-ossp', 'btree_gist');
-- Both should be in: extensions schema
```

### 5. Anti-Overbooking Constraint
```sql
SELECT conname FROM pg_constraint WHERE conname = 'prevent_overbooking';
-- Should return: prevent_overbooking
```

---

## 🐛 Troubleshooting

### Error: "extension already exists"
**Cause**: Extension was previously installed in `public` schema  
**Solution**: Run `fix_extension_schema.sql` to relocate

### Error: "cannot change return type of existing function"
**Cause**: Trying to update a function with different parameters  
**Solution**: Drop the function first with `DROP FUNCTION IF EXISTS function_name(params);`

### Error: "relation already exists"
**Cause**: Tables were partially created before  
**Solution**:
1. Backup any existing data
2. Drop all tables: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run `00_init_database.sql`

### RLS Blocking Queries
**Cause**: Not authenticated as a Supabase user  
**Solution**: 
- Application: Ensure user is logged in via Supabase Auth
- SQL Editor: Use "Service Role" connection mode in Supabase Dashboard

---

## 📦 Optional: Test Data

To populate the database with sample bookings for testing:

```sql
-- Run after base setup
-- File: migrations/20260120130000_seed_test_bookings.sql
```

This creates:
- 50 sample customers
- ~300 bookings across 4 months
- Realistic data distribution

---

## 🔄 Updating an Existing Database

If you already have a CampFlow database and want to apply recent updates:

### Check Current Version
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'app_logs';
```
- If missing → Run `20260120104000_create_logs_table.sql`

### Apply Security Updates (2026-01-30)
1. `fix_function_security.sql` - Function hardening
2. `fix_extension_schema.sql` - Extension organization
3. `rlsLogged.sql` - Complete RLS policies

---

## 📚 Database Schema Overview

### ER Diagram (Conceptual)

```
sectors
  ↓ (1:N)
pitches
  ↓ (1:N)
bookings ←--→ customers (N:1)
  ↓ (1:N)       ↓ (N:1)
booking_guests  customer_groups
                  ↓ (1:N)
                group_season_configuration → pricing_seasons
                group_bundles → pricing_seasons
```

### Key Relationships
- **Sectors contain Pitches**: Organizational grouping
- **Bookings link Pitches + Customers**: Core reservation
- **Booking Guests are per Booking**: Check-in details
- **Customer Groups enable tiered pricing**: VIP, Friends, etc.
- **Pricing Seasons define base rates**: High/Low/Mid season
- **Group configurations override base rates**: Custom pricing per group+season
- **Group bundles are package deals**: Multi-night discounts

---

## 🔐 Security Model

**Authentication Type**: Single-User with Supabase Auth  
**RLS Policy**: `USING (true) TO authenticated`  

### Design Rationale
This application uses authentication **solely for access control**, not multi-tenancy:
- ✅ **Authenticated users**: Full CRUD access
- ❌ **Anonymous users**: Completely blocked
- 🔒 **API Protection**: PostgREST endpoints require valid JWT

This is **intentional by design** for private management applications.

---

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review Supabase logs: **Dashboard** → **Logs** → **Postgres Logs**
3. Verify environment variables are correctly set
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Supabase Postgres version

---

## 📄 License

This database schema is part of the CampFlow project. See main repository for license information.
