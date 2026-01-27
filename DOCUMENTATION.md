# CampFlow Documentation

## Customer Groups Feature (Added 2026-01-27)

### Overview
The system now supports **Customer Groups** (e.g., VIP, Friends, Families). Groups function as a way to apply automatic discounts or custom pricing tiers to customers.

### Database Schema
Two new tables were added:
1.  `customer_groups`: Stores group definitions (Name, Color, Description).
2.  `group_season_configuration`: Links groups to `pricing_seasons`.
    -   `discount_percentage`: Applies a % discount to the total calculated daily rate.
    -   `custom_rates`: A JSONB object that overrides specific base rates (e.g., `{"person": 5.0}`).

The `customers` table now has a `group_id` foreign key.

### Frontend Implementation
1.  **Settings -> Gruppi**: A new tab in the Settings Dialog allows full management of groups and their seasonal rules.
2.  **Customer Management**: The Customers page (`/customers`) now allows creating and editing customers, including assigning them to a group.
3.  **Booking Creation**: When creating a booking, selecting a customer automatically fetches their group configuration.

### Pricing Logic Priority
1.  **Custom Rates**: If a group has a specific rate for a season (e.g., Person Price), it **overrides** the season's base price.
2.  **Base Rates**: If no custom rate is set, the season's base price is used.
3.  **Discount %**: If configured, the percentage is deducted from the *final daily total* (calculated using base or custom rates).

## Bug Fixes and UI Improvements (2026-01-27)

### API Fixes
-   **Customers Visibility**: Fixed `/api/customers` return format.
-   **Customer Details Error**: Added GET handler to `/api/customers/[id]`.
-   **Groups API Error**: Fixed table name typo in `/api/groups`.
-   **Customer Filter**: Added `group_id` filtering support to `/api/customers`.

### UI Enhancements
-   **Customer Details Page**: Enhanced the "Dati Personali" section with color-coded categories.
-   **Check-in Page**: Applied color-coded design language to the **Check-in Guest Form**.
-   **Customers List Page**: Redesigned the search bar to match the Check-in page style.
    -   Unified search and filter container with blur effect.
    -   Added "Filtra per Gruppo" functionality using the new API capability.
