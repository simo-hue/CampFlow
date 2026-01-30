# Incremental Migrations

This directory contains the historical evolution of the CampFlow database schema. Use these migrations to update an existing database.

---

## ⚠️ Important

**If you're starting a new project**, you should use [`fresh-install/00_init_database.sql`](../fresh-install/) instead.

**This directory is for:**
- Updating existing CampFlow databases
- Understanding schema evolution history
- Applying specific patches

---

## 📋 Migration Categories

### Core Structure (01-07)
Original database foundation:
- `01_extensions.sql` - PostgreSQL extensions
- `02_tables.sql` - Core tables
- `03_indexes.sql` - Performance indexes
- `04_triggers.sql` - Auto-update triggers
- `05_functions.sql` - Dashboard functions
- `06_seed_data.sql` - Default data
- `07_rls.sql` - Row Level Security

### Feature Additions (08-12)
Incremental improvements:
- `08_enhance_guest_management.sql` - Extended guest fields
- `09_pricing_seasons.sql` - Seasonal pricing
- `10_update_customers_schema.sql` - Customer groups
- `11_add_license_plate.sql` - License plate tracking
- `12_add_questura_status.sql` - Police notification status

### Timestamped Updates (20260120-20260130)
Date-stamped feature additions:
- `20260120*` - Logging, optimizations, test data
- `20260123*` - Checkout constraint updates
- `20260125*` - Sectors refactoring
- `20260127*` - Customer groups enhancements
- `20260129*` - Bundle pricing system
- `20260130*` - Security patches

### Security Patches
Critical security updates:
- `fix_function_security.sql` - Search path hardening
- `fix_extension_schema.sql` - Extension organization
- `rlsLogged.sql` - RLS policy updates

---

## 🔄 How to Apply

### If You Know Your Current Version
Apply migrations newer than your current version in order:
```sql
-- Example: If you're on 20260127, apply:
20260129150000_group_bundles.sql
20260129153000_refactor_group_bundles.sql
20260129165000_season_specific_bundles.sql
-- ... and so on
```

### If You're Unsure
Check what exists in your database:
```sql
-- Check for recent features
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'group_bundles'
); -- If false, you need migrations after 20260129

-- Check function security
SELECT proname, 
  COALESCE((SELECT setting FROM unnest(proconfig) WHERE setting LIKE 'search_path=%'), 'NOT SET')
FROM pg_proc WHERE proname = 'get_dashboard_stats';
-- If 'NOT SET', apply fix_function_security.sql
```

---

## ⚡ Recommended: Apply Security Patches

Even if your database is current, ensure these are applied:
1. `fix_function_security.sql` - Prevents SQL injection
2. `fix_extension_schema.sql` - Organizes extensions properly
3. `rlsLogged.sql` - Complete RLS coverage

---

## 📚 Need Help?

- Check main [`/DOCUMENTATION.md`](../../../DOCUMENTATION.md)
- Review [`fresh-install/SETUP_GUIDE.md`](../fresh-install/SETUP_GUIDE.md) for verification queries
- Compare your schema with [`/supabase/schema.sql`](../../schema.sql)
