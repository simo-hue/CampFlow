# CampFlow Database Migrations

This directory contains database migrations organized by use case.

---

## 🆕 New Project Setup

**If you're forking this project and starting fresh:**

👉 Go to **[`fresh-install/`](./fresh-install/)** 

This contains:
- `00_init_database.sql` - Complete database setup (single file)
- `SETUP_GUIDE.md` - Step-by-step instructions

**Setup time**: < 5 minutes

---

## 🔄 Existing Database Updates

**If you already have a CampFlow database running:**

👉 Go to **[`incremental/`](./incremental/)**

This contains:
- Numbered migrations (01-12) - Core structure evolution
- Timestamped migrations (20260*) - Feature additions
- Security patches (fix_*.sql) - Security hardening

Apply only migrations newer than your current version.

---

## 📂 Directory Structure

```
migrations/
├── fresh-install/         ← For new Supabase projects
│   ├── 00_init_database.sql
│   └── SETUP_GUIDE.md
│
├── incremental/           ← For updating existing databases
│   ├── 01_extensions.sql
│   ├── 02_tables.sql
│   ├── ...
│   └── 20260130_*.sql
│
├── seed_*.sql             ← Optional test data
├── cleanup_*.sql          ← Maintenance scripts
└── README.md              ← This file
```

---

## 🤔 Which Should I Use?

| Scenario | Use This |
|----------|----------|
| 🆕 Brand new Supabase project | **`fresh-install/`** |
| 🔄 Existing CampFlow database | **`incremental/`** |
| 🧪 Need test data | `seed_test_bookings.sql` |
| 🧹 Database maintenance | `cleanup_*.sql` scripts |

---

## 📚 Additional Resources

- **Main Documentation**: [`/DOCUMENTATION.md`](../../DOCUMENTATION.md)
- **Schema Reference**: [`/supabase/schema.sql`](../schema.sql)
- **Project README**: [`/README.md`](../../README.md)

---

## 🆘 Need Help?

1. Check `fresh-install/SETUP_GUIDE.md` for troubleshooting
2. Review verification queries in `00_init_database.sql`
3. Open an issue on GitHub with error details
