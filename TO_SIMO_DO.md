# MANUAL ACTIONS REQUIRED

-  [ ] Implementare collegamento dei dati già esistenti in db in fase di check in
-  [x] **[2026-06-23]** Run `DB_AUDIT.sql` — DONE. Results folded into `CODEBASE_ANALYSIS.md` §1b/§7. Key outcome: PII is NOT publicly exposed (good), but `{public}` RLS policies on `customer_groups`/`group_bundles`/`group_season_configuration` are open to the anon key (C-3), and 890/1720 customers are orphaned (H-1).

---

## 🟥 PENDING SQL — run these in the Supabase SQL Editor (in order), then paste the verification output back

> These are non-destructive (no row changes) unless noted. Each file ends with a verification query.

-  [ ] **C-3** → `supabase/migrations/incremental/20260623100000_drop_public_group_policies.sql` — removes the 3 public RLS policies. *(safe, drops policies only)*
-  [ ] **N-2** → `supabase/migrations/incremental/20260623101000_add_personal_id_code.sql` — adds `customers.personal_id_code` (Codice Fiscale). *(safe, ADD COLUMN only)*. After running this, the "Codice Fiscale" field in the customer dialog will save correctly.

## 🔑 OTHER MANUAL ACTIONS

-  [ ] **C-1/C-2 (auth)** — After deploying, your existing login cookie is invalidated (the cookie is now a *signed* token, not the literal `true`). **You + staff must log in again once** at `/login` and `/sys-monitor/login`. Nothing else to do — `ADMIN_PASSWORD` is already set and is used as the signing secret.
-  [ ] **(Recommended)** Add a dedicated signing secret env var `AUTH_SECRET` (any long random string) on Vercel. If unset, the code falls back to `ADMIN_PASSWORD` (works, but then changing the password logs everyone out).

