# Fresh Install - Quick Start

This directory contains everything needed to initialize a CampFlow database on a fresh Supabase project.

> **✅ Authoritative (v2.0, regenerated 2026-06-23 from the live production schema).**
> `00_init_database.sql` is the single source of truth for new installs. The
> `../incremental/` folder is **historical** (the migrations applied over time) and
> is kept for reference only — you do **not** need to run it for a fresh install.

---

## 📄 Files

- **`00_init_database.sql`** - Complete database initialization (single script)
- **`SETUP_GUIDE.md`** - Detailed setup instructions

---

## ⚡ Quick Start (5 minutes)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Wait ~2 minutes for initialization

### 2. Execute Setup Script
```sql
-- In Supabase Dashboard → SQL Editor
-- Copy and run: 00_init_database.sql
```

### 3. Verify
Run the verification queries at the end of `00_init_database.sql`:
- ✅ 10 tables created
- ✅ RLS enabled on all
- ✅ Functions secured
- ✅ Extensions in correct schema

---

## 📚 For Detailed Instructions

See **[`SETUP_GUIDE.md`](./SETUP_GUIDE.md)** for:
- Complete step-by-step walkthrough
- Troubleshooting common issues
- Database schema overview
- Verification checklist

---

## ✅ What Gets Installed

- **10 Tables**: pitches, bookings, customers, sectors, etc.
- **Security**: RLS policies + function hardening
- **Performance**: GIST + B-tree indexes
- **Anti-Overbooking**: GIST exclusion constraint
- **Dashboard Functions**: Statistics and analytics
- **Default Data**: Base pricing season + sample sectors

---

**Total Setup Time**: < 5 minutes  
**Zero Configuration Required**: Works out of the box
