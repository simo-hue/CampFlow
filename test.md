
## 🛡️ 3. Data Integrity & Database Constraints
**Goal**: Ensure the database prohibits bad states, even if the UI fails.

- [ ] **Anti-Overbooking Constraint**:
  - *Manual Test*: Attempt to insert a raw SQL booking (via Supabase dashboard) that overlaps an existing one.
  - *Expected*: Database throws `exclusion_violation`.
- [ ] **Orphan Data**:
  - Delete a Customer. Verify their Bookings are also deleted (CASCADE) or blocked (RESTRICT). *Current Schema: CASCADE.*
- [ ] **Validation Checks**:
  - Attempt to set a `status` to 'random_string'. Database should reject (Check Constraint).
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
