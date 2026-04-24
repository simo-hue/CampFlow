# DOCUMENTATION

## [2026-04-24 19:50]: Global Name Display Standardization
*Details*: Standardized the customer name display format to "Cognome Nome" (Last Name First Name) across the entire application. This change ensures a more professional and sorted view in lists and reports.
*Tech Notes*:
- Modified string interpolations in `GuestCard`, `CheckOutDialog`, `Customers` page, `BookingDetailsDialog`, `GuestForm`, `CheckIn` page, and `CustomerDetailPage`.
- Updated API responses in `api/bookings/[id]/guests`, `api/occupancy`, and `api/occupancy/batch` to use the new naming convention.
- Swapped initials in Avatar displays (e.g., "LC" for "Lastname Customer").
- Build verified with `npm run build`.

## [2026-04-24 19:30]: Booking Modification & Pitch Reassignment
*Details*: Implemented the ability to modify booking dates and reassign pitches directly from the occupancy view.
*Tech Notes*:
- Updated `BookingCreationModal` to support edit mode.
- Modified `/api/availability` to accept `exclude_booking_id`.
- Handled dynamic pricing recalculation during edits.

## [2026-04-24 19:20]: Dependency & Synchronization
*Details*: Performed a major sync with remote repository and resolved environment-related build errors.
*Tech Notes*:
- Git pull --rebase with conflict resolution.
- Installed missing Radix UI and jsPDF dependencies.
- Confirmed build stability.
