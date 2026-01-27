# 360° Application Integrity Test Plan

This document provides a comprehensive, deep-dive strategy to verify the application's "Production Readiness". It covers business logic, UI/UX, data integrity, security, and performance.

---

## 🏗️ 1. Core Business Logic & API
**Goal**: Verify the "Brain" of the application works correctly without UI interference.

### 1.1 Availability Algorithm (`/api/availability`)
**Test Scenario**:
- **Setup**: One booking already exists on **Pitch 101** from `2026-06-01` to `2026-06-10`.
- **Test A (Exact Overlap)**: Search `2026-06-01` to `2026-06-10`.
  - *Expected*: Pitch 101 MUST be hidden.
- **Test B (Partial Overlap - Start)**: Search `2026-05-28` to `2026-06-02`.
  - *Expected*: Pitch 101 MUST be hidden.
- **Test C (Partial Overlap - End)**: Search `2026-06-09` to `2026-06-15`.
  - *Expected*: Pitch 101 MUST be hidden.
- **Test D (Inside)**: Search `2026-06-03` to `2026-06-05`.
  - *Expected*: Pitch 101 MUST be hidden.
- **Test E (Enveloping)**: Search `2026-05-01` to `2026-07-01`.
  - *Expected*: Pitch 101 MUST be hidden.
- **Test F (Adjacent - Touching)**: Search `2026-06-10` to `2026-06-15` (Check-out day is Check-in day).
  - *Expected*: Pitch 101 MUST be **VISIBLE** (Standard hospitality rule: Check-out morning = Check-in afternoon). *Note: Verify implementation logic `[)` vs `[]`*.

### 1.2 Pricing Engine (`src/lib/pricing.ts`)
**Test Scenario**: Verify seasonal calculation logic (High: Jun-Aug, Mid: May/Sep, Low: Rest).
- **Test A (Single Season)**: 5 nights in July (High Season).
  - *Calculation*: `5 * HighRate`.
- **Test B (Cross-Season)**: May 30 to June 2 (2 nights Mid, 1 night High).
  - *Calculation*: `(2 * MidRate) + (1 * HighRate)`.
- **Test C (Pitch Types)**: Verify "Piazzola" vs "Tenda" rates applied correctly for same dates.

---

## 🖥️ 2. Frontend & User Experience (UX)
**Goal**: Verify the "Face" of the application is responsive, intuitive, and error-free.

### 2.1 Dashboard (`/`)
- [ ] **Widget Data**:
  - Compare "Arrivals"/"Departures" numbers with actual list counts.
  - Verify "Occupancy" chart renders bars for the next 7 days.
- [ ] **Search Interaction**:
  - Run a search. Verify URL parameters update (e.g., `?check_in=...`).
  - Refresh page. Search details should persist (if implemented) or reset gracefully.
- [ ] **Responsive Design**:
  - Open on Mobile (375px width).
  - Check if "Search" bar stacks vertically.
  - Check if "Stats Cards" stack or scroll.

### 2.2 Customer Management (`/customers`)
- [ ] **Deep Pagination/Scroll**: Scroll through all 50 seeded customers. Ensure no "glitchy" loading.
- [ ] **Search Debounce**: Type quickly. Request should only fire after typing stops (usually 300-500ms).
- [ ] **Data Density**: Check if long names ("Alessandro Massimiliano...") break the table layout.

### 2.3 Check-in Flow (`/checkin`)
- [ ] **Guest Documents**:
  - Verify strict validation: Document Number is required? Birth Date required?
- [ ] **Dynamic Updates**:
  - Add a guest. Total Booking Price *should* update (if dynamic guest pricing is active).
  - "Questura Sent": Toggle ON. Refresh page. Toggle should remain ON.

---

## 🛡️ 3. Data Integrity & Database Constraints
**Goal**: Ensure the database prohibits bad states, even if the UI fails.

- [ ] **Anti-Overbooking Constraint**:
  - *Manual Test*: Attempt to insert a raw SQL booking (via Supabase dashboard) that overlaps an existing one.
  - *Expected*: Database throws `exclusion_violation`.
- [ ] **Orphan Data**:
  - Delete a Customer. Verify their Bookings are also deleted (CASCADE) or blocked (RESTRICT). *Current Schema: CASCADE.*
- [ ] **Validation Checks**:
  - Attempt to set a `status` to 'random_string'. Database should reject (Check Constraint).

---

## 🔒 4. Security & Access
**Goal**: Ensure unauthorized users cannot destroy data.

- [ ] **Route Protection**:
  - Try accessing `/sys-monitor` without logging in. Should redirect to login or show 403.
- [ ] **API Security**:
  - Try sending a POST request to `/api/bookings` without valid payload. Should 400.
  - (If Auth implemented) Try accessing API without session cookie.

---

## 📊 5. Performance & Stress
**Goal**: Application must handle the seeded load effortlessly.

- [ ] **Render Blocking**: Navigate `Dashboard` -> `Customers`. Is there a white flash? (Should be minimized by Next.js prefetching).
- [ ] **Query Efficiency**:
  - Open `sys-monitor` -> `Latency`.
  - Load `Customers` page. Latency should remain < 200ms with 50 rows.
- [ ] **Input Lag**:
  - Edit a text field in "Settings". Is there typing lag?

---

## 🚀 6. Critical User Flows (The "Golden Paths")
**Goal**: If these fail, the business stops.

### 6.1 The "Walk-in" Scenario
1.  **Search** available pitch for TONIGHT (1 night).
2.  **Select** a pitch.
3.  **Create** "New Customer" inline (or select existing).
4.  **Confirm** booking.
5.  **Check-in** immediately (add documents).
6.  **Verify**: Dashboard shows Occupancy +1.

### 6.2 The "Checkout" Scenario
1.  **Identify** a booking ending today in `/departures`.
2.  **Process** Checkout.
3.  **Verify**: Status becomes `checked_out`. Dashboard Occupancy -1 (or stays same if relying on strictly date-based logic, verify this!).

---

## ⚠️ Uncovered Areas / Risks (Based on Code Review)
- **Pricing Hardcoding**: Seasons are hardcoded in `src/lib/pricing.ts`.
  - *Risk*: Client cannot change prices without a developer deployment.
- **Availability "Touching"**:
  - Code uses `[checkIn, checkOut)`.
  - Ensure standard SQL `overlaps` handles `end_date = start_date` correctly (usually it does by exclusion, but requires `daterange` upper bound exclusive).

---

## ✅ Execution Checklist
To certify "Production Ready", execute the following order:
1.  **Data Tests** (Section 3) - Verify constraints first.
2.  **API Tests** (Section 1) - Verify logic next.
3.  **Flow Tests** (Section 6) - Verify usage.
4.  **UI Polish** (Section 2) - Verify look & feel.
