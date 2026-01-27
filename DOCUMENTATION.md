# CampFlow Implementation Documentation

## Seasonal Pricing Variables Implementation

**Date:** 2026-01-27
**Status:** Completed

### Overview
Moved from a hybrid pricing model (Global Settings + Hardcoded logic) to a **fully database-driven Seasonal Pricing system**. All pricing variables (People, Children, Dogs, Cars) are now configurable per-season.

### Changes Implemented

1.  **Database Schema (`pricing_seasons` table)**
    *   Added columns: `person_price_per_day`, `child_price_per_day`, `dog_price_per_day`, `car_price_per_day`.
    *   Ensures comprehensive pricing configuration within the season record itself.

2.  **Backend Logic (`src/lib/pricing.ts`)**
    *   **Refactored `calculatePrice`**: Removed hardcoded checks for High/Mid/Low season.
    *   **Dynamic Resolution**: The system now accepts a list of `seasons`. It finds the active season with the highest priority that covers a given date.
    *   **Context Support**: Accepts distinct counts for Guests, Children, Dogs, and Cars to calculate the daily total accurately using the season's specific rates.

3.  **API Routes**
    *   **`GET /api/pricing/calculate`**: Fetches active seasons from DB and uses the new shared logic to return price breakdowns for the frontend (Booking Modal).
    *   **`POST /api/bookings`**: Fetches active seasons serverside to ensure the final booking price matches the configuration at the moment of creation.

4.  **Frontend**
    *   **Settings Page**: Removed legacy global pricing inputs.
    *   **Season Dialog**: Added input fields for the new variables, allowing full control over pricing for each season.
    *   **Booking Modal**: Now sends individual counts (children, dogs, cars) to the calculation API.

### Fallback Mechanism
A **"Stagione Base (Default)"** with Priority 0 is automatically created/used. This ensures that even if no specific season (High/Low) is defined for a date, the system falls back to these base rates instead of returning zero or erroring.

### UI Improvements
*   **Delete Confirmation**: Added a confirmation popup (Dialog) when deleting a pricing season to prevent accidental deletions.
*   **Smart Save Button**: The "Save Changes" button in the season editor is now disabled by default and only becomes active when actual changes are detected.

## Season Stack Visualization ("Tower of Hanoi")

**Date:** 2026-01-27
**Status:** Completed

### Overview
Implemented a visual representation of the pricing seasons hierarchy to allow users to intuitively understand which season takes precedence.

### Components
*   **`SeasonStackVisualization.tsx`**: A new component that visualizes seasons in a stacked format based on priority.
    *   **High Priority (>= 15)**: Top of the stack.
    *   **Medium Priority (5-14)**: Middle.
    *   **Low Priority (< 5)**: Bottom (Base).
*   **Integration**: Added to the `SeasonalPricingManager` component in the Settings page.

### Features
*   **Visual Hierarchy**: Clearly shows priority levels.
*   **Tooltips**: Hovering over a season block reveals detailed pricing info.
*   **Dynamic**: Automatically updates as seasons are added or modified.
