# MANUAL ACTIONS REQUIRED

-  [x] **H-2/H-3 schema regen** — introspection run; `fresh-install/00_init_database.sql` rebuilt from live (v2.0). Nothing more to run unless you stand up a fresh project.

## 🟥 PENDING SQL — run in the Supabase SQL Editor
-  [ ] **B1** → `supabase/migrations/incremental/20260623110000_drop_dead_log_functions.sql` — drops 2 dead/broken log functions. *(safe, drops unused functions only)*

## [2026-08-08] CampFlow — deploy needed for the P0 SEO fixes

The canonical fix (was pointing at the `campflow.app` parking page) and the removal of the fake 5.0/12 rating are committed to nothing yet — they sit as working-tree changes on **`main`**, and on the **`website-only`** branch which is what actually gets published.

To publish: check out `website-only`, review the change to `src/app/page.tsx`, then run `./deploy.sh` (it builds and force-pushes `gh-pages`).

Note `deploy.sh` uses `git stash` / `git checkout` / `git rm -rf .` and force-pushes — run it from a clean tree.
