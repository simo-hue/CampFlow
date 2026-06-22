# 🔍 CampFlow — Deep Codebase Analysis

> **Generated:** 2026-06-23
> **Scope:** Full static analysis of `src/`, `supabase/`, config, and documentation.
> **Status legend:** ✅ Confirmed in code · 🧪 Needs DB verification (see `DB_AUDIT.sql`) · 💡 Recommendation

This document started as the **discovery phase** output. The discovery has since been **verified against the live DB** and most findings **implemented** on branch `fix/security-and-data-integrity`.

---

## 0. Fix Status (updated 2026-06-23, branch `fix/security-and-data-integrity`)

| ID | Finding | Status |
|----|---------|--------|
| **C-1/C-2** | Forgeable cookie auth → god-mode | ✅ **Fixed** — HMAC-signed expiring tokens (`src/lib/auth.ts`); verified live that a forged `=true` cookie now returns 401. Unit-tested. |
| **C-3** | `{public}` RLS on group tables | 🟡 **Ready — run SQL** `20260623100000_drop_public_group_policies.sql` (see `TO_SIMO_DO.md`). |
| **C-4** | PostgREST filter injection (`/api/customers`) | ✅ **Fixed** — input sanitized; only `.or()` site in the codebase. |
| **C-5** | `/api/fix-db` GET mutation | ✅ **Fixed** — route removed. |
| **H-1** | Non-atomic booking → orphans | ✅ **Mitigated** — new-customer rollback on booking failure; read-only diagnostic for the 890 existing orphans. |
| **H-2/H-3** | Stale fresh-install / migration sprawl | 🟡 **Partial** — loud STALE warning added; full pg_dump regeneration deferred (needs your run). |
| **H-4** | `questura_sent` mismatch | ✅ **Resolved by audit** (column exists). |
| **H-5** | No price recalc on edit | ✅ **Fixed** — shared `bookingPricing.ts`; PATCH recalculates. |
| **M-1** | Pricing discount/bundle rules unresolved | 🟡 **Characterized** (tests pin current behavior); product decision still yours. |
| **M-5** | No security headers | ✅ **Fixed** — headers added & verified live (CSP deferred — needs nonces). |
| **M-6** | No overbooking regression test | 🟡 **Deferred** — needs a live DB; auth + pricing now unit-tested instead. |
| **N-1** | Dead `stats.ts` + anon client | ✅ **Fixed** — removed; app is now 100% service-role. |
| **N-2** | `personal_id_code` not stored | ✅ Code fixed + 🟡 **run SQL** `20260623101000_add_personal_id_code.sql`. |
| **N-3** | Split-brain guest names | 🟡 **Deferred** — needs a product decision (canonical field) + is lossy on live data. |
| **N-4** | `is_head_of_family` type drift | ✅ **Fixed**. |
| **L-1/L-3/L-4** | Backups, env.example, README | ✅ **Fixed**. |
| **M-2/M-3/M-4, L-5/L-6** | Logger coupling, `any`/console, big components, doc sprawl | ⬜ **Deferred** (lower-risk/value; left for a focused pass). |

**You still need to:** run the two SQL files in `TO_SIMO_DO.md` (C-3, N-2), and re-login once (auth cookies changed).

---

## 1. Executive Summary

CampFlow is a **Next.js 16 / React 19 / Supabase (Postgres)** campsite PMS. The product is feature-rich and the core booking engine is genuinely well-designed: the **anti-overbooking GIST exclusion constraint is the right architecture** and is correctly relied upon by the booking APIs (409 on `23P01`).

However, the codebase has accumulated significant debt in three areas that I consider **blocking for the "Production Ready" badge**:

| Area | Verdict |
|------|---------|
| **Authentication & Authorization** | 🔴 **Critically weak.** Auth is a forgeable cookie-*existence* check; god-mode destructive actions sit behind it. |
| **Database / RLS posture** | 🔴 **Partially unsafe (verified).** RLS *is* enabled, but `{public}` policies leave `customer_groups`, `group_bundles`, `group_season_configuration` world-read/writable via the public anon key. PII tables are `authenticated`-only (safe). |
| **Schema source-of-truth** | 🟠 **Fragmented.** Three competing schema definitions; the "fresh-install" script is stale and would produce a broken app. |
| Core booking engine (GIST) | 🟢 Solid. |
| Pricing engine | 🟡 Works, but business rules are unresolved in-code. |
| Frontend / UX | 🟢 Mostly good; a few oversized components. |
| Tooling (TS/lint) | 🟢 `tsc --noEmit` passes cleanly. |

**Headline numbers:** 147 TS/TSX files · ~23k LOC · 30 API routes · 87 `any` usages · 132 raw `console.*` calls · 4 tracked `.bak` files · 0 automated tests.

**Live DB scale (audit 2026-06-23):** 1,720 customers · 896 bookings · 1,644 guests · 290 pitches · 3 seasons. **This is a real, in-production system holding real guest PII (names, phones, documents, birth data)** — which raises the severity of the auth findings below from "theoretical" to "active risk."

---

## 1b. DB Audit Results — Verified (2026-06-23)

`DB_AUDIT.sql` was run against the live database. This **changed several conclusions** from the initial static pass — recorded honestly here:

**✅ Confirmed as real problems**
- **C-3 (sharpened):** RLS *is* enabled on every table, BUT three tables carry a `{public}` "Enable all access for all users" policy → `customer_groups`, `group_bundles`, `group_season_configuration` are **readable, writable, and deletable by anyone holding the public anon key** (which ships in the browser bundle). The app fetches these via `/api/groups` (service role) and does **not** need these policies — they are pure attack surface. An attacker could rewrite bundle prices to €0 or delete VIP tiers.
- **H-1 (corroborated):** **890 of 1,720 customers (52%) have no bookings.** Consistent with the non-atomic booking flow leaving orphans (also partly explained by direct customer creation / `clearBookings`). Real data-hygiene issue either way.

**🟢 Closed / downgraded (good news — initial worst-cases did NOT materialize)**
- **PII is *not* publicly exposed:** `customers`, `bookings`, `booking_guests` have `authenticated`-only policies, and the anon role is never authenticated → anon cannot read them. The catastrophic "anyone can dump all PII" scenario is **not** present.
- **H-4 `questura_sent` — RESOLVED:** the column **does** exist on `bookings` (boolean, default false). The frontend works. (`booking_guests.questura_status` from the old init script is *not* in the live DB.)
- **Logging — RESOLVED:** `app_logs` live shape (`level` lowercase, `meta`, `timestamp`, `environment`) matches the logger code. Logging works.
- **Pricing €0-today — RESOLVED:** "Media Stagione" (priority 10) covers today; `is_recurring` exists. No €0 risk on live data.
- **"`get_weekly_occupancy` missing" — FALSE ALARM:** the dashboard route computes occupancy **in memory** via `supabaseAdmin`; it uses no RPC. The DB function is named `get_weekly_occupancy_stats` and is simply **unused/dead**.
- **"Stats page broken via anon RLS" — DOWNGRADED:** the only anon-client consumer, `src/lib/api/stats.ts`, is **dead code** — nothing imports it (the real Stats page calls `/api/stats`). It should just be deleted (see N-1).

**🆕 New findings surfaced by the audit** (detailed in §4b)
- **N-1** `src/lib/api/stats.ts` + its anon `client.ts` import are dead code.
- **N-2** `personal_id_code` (Codice Fiscale) is collected by `CustomerDialog` but **has no column** in `customers` → direct customer save likely errors / silently drops the field.
- **N-3** `booking_guests` has **both** `full_name` and `first_name`/`last_name`; the booking POST writes `full_name`, everything else uses `first_name`/`last_name` → split-brain guest names.
- **N-4** Type/DB drift: `is_head_of_family` exists in DB but not in the TS type.

---

## 2. What's Already Implemented (the good)

- **Booking core** — `bookings` table with `DATERANGE` + GIST `EXCLUDE` constraint (`prevent_overbooking`) physically prevents double-booking. Booking + update APIs correctly catch `23P01` → 409. *(`src/app/api/bookings/route.ts`, `.../[id]/route.ts`)*
- **Availability search** — application-level filter backed by the DB constraint as the real guard. Correct two-layer approach. *(`src/app/api/availability/route.ts`)*
- **Seasonal pricing** — dynamic, priority-based seasons with recurring (year-independent) support, custom group rates, % discounts, and multi-night bundles. *(`src/lib/pricing.ts`)*
- **Customer groups / VIP / bundles** — full CRUD + per-season configuration.
- **Check-in / guest management** — detailed PII capture (documents, birth, residence) for Italian *questura* / *schedine alloggiati* compliance, geo-autocomplete from `comuni.json`.
- **Dashboard** — optimized single-scan `get_dashboard_stats()` RPC, weekly occupancy, KPI/revenue/occupancy charts (Recharts).
- **Sys-monitor** — admin "god mode" dashboard: logs viewer, DB stats, backup, seed/reset.
- **Exports** — PDF arrivals report (jsPDF), occupancy export.
- **Public website** — `/w/*` marketing pages (features, pricing, FAQ, privacy, terms, contact).
- **Data layer** — React Query with sensible caching defaults; typed domain model in `src/lib/types.ts`.
- **Tooling** — TypeScript strict mode, clean typecheck, ESLint (next config), universal logger with DB persistence.

---

## 3. 🔴 Critical Findings (Security & Data-Loss)

### C-1 — Authentication is a forgeable cookie *existence* check ✅
`src/middleware.ts:31-33` gates the entire app on:
```ts
const authToken = request.cookies.get('campflow_auth')?.value;
if (!authToken) { /* redirect/401 */ }
```
The cookie value is literally set to the string `'true'` (`src/app/login/actions.ts:21`) and is **never validated**. Anyone can send `Cookie: campflow_auth=anything` (via curl/DevTools) and is treated as fully authenticated. There is no signature, JWT, or session lookup.
The sys-monitor path is identical: `getAuthStatus()` returns `cookieStore.has('sys_monitor_auth')` — *existence only* (`src/app/sys-monitor/login/actions.ts:42-45`).
**💡 Fix:** Issue a signed/HMAC or JWT session token (or adopt Supabase Auth) and verify the value, not just presence.

### C-2 — Destructive "god-mode" actions behind the forgeable cookie ✅
`/sys-monitor` is **explicitly excluded from middleware auth** (`middleware.ts:23`) and its server actions only check `getAuthStatus()` (existence). These include:
- `resetSystemAction` — wipes bookings, **customers (PII)**, logs, pitches, seasons. *(`sys-monitor/login/actions.ts:71`)*
- `clearCustomersAction` — deletes **all customers + cascaded bookings**. *(`:149`)*
- `clearBookingsAction`, `clearPitchesAction`, `clearSeasonsAction`, `generateBackupAction` (full DB export).

A forged cookie ⇒ a single POST can **destroy or exfiltrate the entire database**. This is the most severe issue in the codebase.

### C-3 — `{public}` RLS policies expose pricing/group tables to the public anon key ✅ (verified)
RLS is enabled everywhere, but three tables have an "Enable all access for all users" policy targeting the **`public`** role (= includes `anon`):
| Table | Policy | Role | Cmd |
|-------|--------|------|-----|
| `customer_groups` | Enable all access for all users | `{public}` | ALL |
| `group_bundles` | Enable all access for all users | `{public}` | ALL |
| `group_season_configuration` | Enable all access for all users | `{public}` | ALL |
The **anon key is shipped publicly** in the browser bundle and the Supabase REST endpoint is internet-reachable. So **anyone** can `GET`/`POST`/`DELETE` these tables directly (e.g. rewrite `group_bundles.pitch_price` to 0, delete VIP groups). The app reads these via `/api/groups` using the **service role**, so it does **not** rely on the `{public}` policies — they are gratuitous attack surface (the Supabase "quick-fix" template).
*(Good news, verified: `customers` / `bookings` / `booking_guests` are `authenticated`-only, and the app never logs in as `authenticated` via Supabase, so guest PII is **not** anon-readable.)*
**💡 Fix:** Drop the three `{public}` policies (the app keeps working via service role). Keep the deny-by-default posture for `anon` on all tables. Then delete the dead anon client path (N-1).

### C-4 — PostgREST filter injection + unauth'd PII read in `/api/customers` ✅
`src/app/api/customers/route.ts:15`:
```ts
queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,...`);
```
`query` comes straight from the URL and is interpolated unescaped into a PostgREST filter string. A crafted `q` (containing `,` / `)` / `*`) can alter the filter logic (PostgREST filter injection). The endpoint returns full customer PII and is gated only by the C-1 cookie.
*(Secondary: `queryBuilder.or(...)` / `.eq(...)` return values aren't reassigned — relies on builder mutation; works today but fragile.)*
**💡 Fix:** Use `.ilike()` per-column or `.textSearch()`, or sanitize/encode `query`; never string-interpolate user input into `.or()`.

### C-5 — `/api/fix-db` mass-mutates data on a GET ✅
`src/app/api/fix-db/route.ts` is a **GET** route that bulk-updates `sector_id` on **all** pitches with no sector. GET = prefetchable/CSRF-friendly/cacheable, and this is a one-off migration hack left in the tree.
**💡 Fix:** Delete the route (move to a SQL migration), or convert to an authenticated POST.

---

## 4. 🟠 High Findings (Correctness & Data Integrity)

### H-1 — Booking creation is **not** atomic (contradicts the README) ✅
`README.md` claims *"Every booking is an atomic transaction."* In reality `POST /api/bookings` performs **separate** sequential writes: resolve/insert `customer` → insert `booking` → insert `booking_guests` (`route.ts:128-323`). If the booking insert fails (e.g., overbooking 409) **after** a new customer was created, you get an **orphaned customer**; if guest insert fails, partial state. There is no transaction or RPC wrapping them.
**💡 Fix:** Wrap the whole flow in a Postgres function (`SECURITY DEFINER` RPC) so customer+booking+guests commit atomically.

### H-2 — The "fresh-install" schema is stale → a fresh setup is broken ✅ (live DB is fine; the *script* is the problem)
The audit confirmed the **live DB is correct** (it has `first_name`/`last_name`, `is_recurring`, `children_count`, `is_manual_price`, `questura_sent`, the correct `app_logs` shape, etc.) — so the incremental migrations were applied over time. The defect is that `supabase/migrations/fresh-install/00_init_database.sql` (what the README tells *new* users to run) is **out of sync** with that reality. Notable gaps vs. what the code reads/writes:
| Table | `fresh-install` has | App expects (from incrementals + code) |
|-------|--------------------|-----------------------------------------|
| `customers` | `full_name` | `first_name`, `last_name`, + birth/residence/document/`citizenship`/`gender`/`license_plate` |
| `bookings` | — | `children_count`, `dogs_count`, `cars_count`, `is_manual_price`, (`questura_sent`?) |
| `pricing_seasons` | — | `is_recurring` |
| `customer_groups` | — | `force_manual_price` |
| `app_logs` | `level CHECK ('INFO'…)`, `metadata`, `created_at` | `level ('info'…)`, `meta`, `timestamp`, `environment` |
A new install per the README would **fail at runtime** (missing columns, `full_name NOT NULL` violations, log-insert CHECK violations). The default season is also seeded with **fixed 2024 dates** and no `is_recurring`, so current-year pricing could resolve to "Nessuna Stagione" → **€0**.

### H-3 — Three competing schema sources + ambiguous migration order ✅
There are **three** definitions of truth: `supabase/schema.sql`, `supabase/migrations/fresh-install/`, and `supabase/migrations/incremental/`. The incrementals mix a `01–12` numeric scheme with `2026…` timestamps and contain **collisions**: two `08_*`, two `20260130_*`, and **two `*_customer_groups.sql`** (`20260127000000` 61 lines vs `20260127120000` 40 lines). Ordering is lexical-luck, not designed. RLS is contradictory across files (`07_rls.sql` disables; `rlsLogged.sql`/`fresh-install` enable).
**💡 Fix:** Pick **one** mechanism (Supabase CLI migrations), regenerate a single authoritative baseline from the live DB, delete the rest.

### ~~H-4 — `questura_sent` mismatch~~ — ✅ RESOLVED by audit
The audit confirmed `bookings.questura_sent` (boolean, default false) **exists** in the live DB, so the frontend/PATCH path works. The `booking_guests.questura_status` column from the stale init script is **not** present in the live DB. No action needed beyond removing it from the stale `fresh-install` script (folds into H-2).

### H-5 — Price not recalculated on booking edits ✅
`PATCH /api/bookings/[id]` updates dates/pitch/guests but **only** changes `total_price` if the client passes it (`route.ts:118-138`, with the in-code comment "we might want to recalculate price"). Editing a stay's dates/occupancy can leave a **stale price**.

---

## 4b. 🟠 New Findings from the DB Audit

### N-1 — Dead code: `src/lib/api/stats.ts` (+ the only anon-client usage) ✅
Nothing imports `fetchStats` from `@/lib/api/stats`; the real Stats page and `QuickStatsWidget` use `fetch('/api/stats')`. This file is the **sole** importer of the public anon `src/lib/supabase/client.ts`. **💡 Fix:** delete `lib/api/stats.ts`; once gone, `client.ts` can also go (the app becomes 100% service-role server-side), shrinking the attack surface and removing the anon-key dependency.

### N-2 — `personal_id_code` (Codice Fiscale) collected but has no DB column ✅🧪
`CustomerDialog.tsx` renders and submits `personal_id_code` (`:175-177`), and the TS `Customer` type declares it (`types.ts:125`) — but the live `customers` table has **no such column** (audit check #3). `POST /api/customers` mass-spreads the payload into `insert(...)`, so Supabase will reject with *"Could not find the 'personal_id_code' column"* → **creating a customer from the dialog likely fails** (customers created through the booking flow are unaffected, since that path doesn't send the field). **💡 Fix:** add the column (it matters for *questura* compliance) **or** strip it before insert. Either way, allow-list insertable columns.

### N-3 — Split-brain guest names: `full_name` vs `first_name`/`last_name` ✅
`booking_guests` has **both** name systems (audit check #5). The booking POST writes `full_name` (`bookings/route.ts:310`) leaving `first_name`/`last_name` NULL, while check-in / `upsert-guest` / the TS type all use `first_name`/`last_name`. Guests created at booking time and at check-in time are shaped differently → reporting/PDF inconsistencies. **💡 Fix:** pick `first_name`/`last_name` as canonical; backfill + drop `full_name`.

### N-4 — Type/DB drift: `is_head_of_family` ✅
`booking_guests.is_head_of_family` exists in the DB but is absent from the `BookingGuest` TS type — so it's invisible to the app layer. Reconcile (add to type, or drop the column if unused).

---

## 5. 🟡 Medium Findings (Maintainability)

- **M-1 — Pricing business rules unresolved in-code ✅.** `src/lib/pricing.ts:139-167` contains a long block of *thinking-out-loud* comments ("Let's assume", "Hard to split", "Compromise") about whether the % discount should stack on bundle prices. The current behavior (discount only when `!bundleUnitPrices`) is a guess, not a spec. Risk of **incorrect charges**. → Needs a product decision, then a unit test.
- **M-2 — Logger ↔ client coupling ✅.** `logger.ts` dynamically `import()`s a `'use server'` module from client code, so every client-side `warn`/`error` becomes an **unauthenticated server-action round-trip** (`logToDb` has no auth → log-spam vector). The 10%-probability inline cleanup also runs delete queries on random user requests.
- **M-3 — 87 `any` + 132 raw `console.*` ✅.** A `logger` abstraction exists but is bypassed 132 times; `any` undermines the otherwise-strict typing. Empty `catch (e) {}` blocks in `sys-monitor` stats swallow errors silently.
- **M-4 — Oversized components ✅.** `SectorOccupancyViewer.tsx` (915), `checkin/page.tsx` (795), `BookingCreationModal.tsx` (738), `GroupManagement.tsx` (722) — hard to test/maintain; candidates for decomposition.
- **M-5 — No security headers ✅.** `next.config.ts` is empty — no CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy`.
- **M-6 — No automated tests ✅.** README claims *"a suite of tests for critical paths"*; the repo has **zero** test files (only `test.md`). The overbooking guarantee, in particular, deserves a regression test.

---

## 6. 🟢 Low Findings (Cleanup & Docs)

- **L-1 — 4 tracked backup files ✅:** `SectorOccupancyViewer.tsx.bak/.bak2/.backup3`, `BookingCreationModal.tsx.backup_pricing`. Remove from git.
- **L-2 — Build artifacts in tree ✅:** `out/` and `_next/` at repo root (stale `next export`/gh-pages output). Not tracked, but clutter.
- **L-3 — `env.example` is missing `ADMIN_USERNAME` / `ADMIN_PASSWORD` ✅.** A new dev copying it gets a **completely un-loginable app** (login needs both). Also missing from the doc set entirely.
- **L-4 — README overclaims ✅:** "PWA Ready / Works offline" — there is **no manifest, no service worker, no `next-pwa`** anywhere. "Next.js 15" (actually **16**). "Production Ready" given §3. Package name is `campflow-temp` v`0.1.0` while sys-monitor advertises `v1.4.2_LTS`.
- **L-5 — Documentation sprawl ✅:** ~10 root markdown files, several stale (`DA_IMPLEMENTARE.md`, `TO_SIMO_DO_UPDATE.md`, `SECTOR_VIEWER_UPDATE.md`, `COCKROACHDB_ANALYSIS.md`). Consolidate into `/docs`.
- **L-6 — `debug_schema.sql` / `env_example` (duplicate of `env.example`) stray files.**

---

## 7. ✅ Database Verification — DONE

`DB_AUDIT.sql` was executed on 2026-06-23. Summary of what it settled:

| Check | Result | Impact |
|-------|--------|--------|
| RLS enabled per table | ✅ All `true` | Good baseline |
| RLS policies/roles | ⚠️ `{public}` ALL on `customer_groups`, `group_bundles`, `group_season_configuration` | **C-3 confirmed** |
| `customers` shape | ✅ `first_name`/`last_name` present; ❌ no `personal_id_code` | H-2 (script stale); **N-2** |
| `bookings` shape | ✅ has `children/dogs/cars_count`, `is_manual_price`, **`questura_sent`** | **H-4 resolved** |
| `booking_guests` shape | ⚠️ both `full_name` **and** `first_name/last_name`; `is_head_of_family` | **N-3, N-4** |
| `pricing_seasons.is_recurring` | ✅ present; a season covers today | H-2 (script); €0 risk closed |
| `app_logs` shape | ✅ matches logger code | Logging works |
| Required functions | ✅ present (`get_weekly_occupancy` not needed — route is in-memory) | False alarm closed |
| `prevent_overbooking` | ✅ exclusion constraint present | Core guarantee intact |
| Orphan customers | ⚠️ **890 / 1,720 (52%)** | Corroborates **H-1** |

---

## 8. Recommended Remediation Order

**Phase 0 — Stop the bleeding (security):**
1. **C-1/C-2** — Real session validation (signed/JWT token or Supabase Auth) + protect `/sys-monitor` actions with a check that isn't cookie-*existence*. *(highest priority — 1,720 real customers' PII + DB-wipe actions sit behind this.)*
2. **C-3** — Drop the three `{public}` RLS policies (quick SQL; app keeps working via service role). Script provided below in the next step.
3. **C-4** — Fix the `/api/customers` PostgREST filter injection.
4. **C-5** — Remove/secure `/api/fix-db`.

**Phase 1 — Data integrity:**
5. **H-1** — Atomic booking RPC (and triage the 890 orphan customers).
6. **N-2** — Decide on `personal_id_code` (add column vs remove from form) — affects *questura* compliance.
7. **H-5** — Recalculate price on booking edits.
8. **N-3** — Unify guest names on `first_name`/`last_name`; retire `full_name`.

**Phase 2 — Schema hygiene:**
9. **H-2/H-3/N-4** — Consolidate to one migration system; regenerate an authoritative baseline **from the live DB** (which is the real source of truth); delete the stale `fresh-install` + duplicate migrations; reconcile `is_head_of_family`.

**Phase 3 — Quality & docs:**
10. **N-1** — Delete dead `lib/api/stats.ts` + anon `client.ts`.
11. **M-1** (pricing spec + unit tests), **M-5** (security headers), **M-6** (overbooking regression test).
12. **L-1…L-6** cleanup + README/`env.example` honesty pass.

---

*Discovery complete and **verified against the live DB**. Recommend starting with Phase 0 — the quickest high-impact win is **C-3** (drop 3 policies, ~5 lines of SQL), but **C-1/C-2** is the one that actually matters most. Tell me which to implement first.*
