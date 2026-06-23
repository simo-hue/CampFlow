# MANUAL ACTIONS REQUIRED

-  [x] **H-2/H-3 schema regen** — introspection run; `fresh-install/00_init_database.sql` rebuilt from live (v2.0). Nothing more to run unless you stand up a fresh project.

## 🟥 PENDING SQL — run in the Supabase SQL Editor
-  [ ] **B1** → `supabase/migrations/incremental/20260623110000_drop_dead_log_functions.sql` — drops 2 dead/broken log functions. *(safe, drops unused functions only)*
