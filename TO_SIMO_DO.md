# MANUAL ACTIONS REQUIRED

-  [ ] Implementare collegamento dei dati già esistenti in db in fase di check in
-  [x] **[2026-06-23]** Run `DB_AUDIT.sql` — DONE. Results folded into `CODEBASE_ANALYSIS.md` §1b/§7. Key outcome: PII is NOT publicly exposed (good), but `{public}` RLS policies on `customer_groups`/`group_bundles`/`group_season_configuration` are open to the anon key (C-3), and 890/1720 customers are orphaned (H-1).

---

## 🟥 PENDING SQL — run these in the Supabase SQL Editor (in order), then paste the verification output back

> These are non-destructive (no row changes) unless noted. Each file ends with a verification query.

-  [ ] **C-3** → `supabase/migrations/incremental/20260623100000_drop_public_group_policies.sql` — removes the 3 public RLS policies. *(safe, drops policies only)*
