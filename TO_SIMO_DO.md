# MANUAL ACTIONS REQUIRED

-  [ ] Implementare collegamento dei dati già esistenti in db in fase di check in
-  [x] **[2026-06-23]** Run `DB_AUDIT.sql` — DONE. Results folded into `CODEBASE_ANALYSIS.md` §1b/§7. Key outcome: PII is NOT publicly exposed (good), but `{public}` RLS policies on `customer_groups`/`group_bundles`/`group_season_configuration` are open to the anon key (C-3), and 890/1720 customers are orphaned (H-1).