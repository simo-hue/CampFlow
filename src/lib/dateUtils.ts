import { parseISO, differenceInDays, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Helper: Parse YYYY-MM-DD string as UTC midnight Date to avoid timezone shifts
 */
function parseAsUTC(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: string, start: string, end: string): boolean {
    return date >= start && date <= end; // String comparison is safe for YYYY-MM-DD
}

/**
 * Calculate number of nights between two dates
 * Uses UTC to ensure consistent result regardless of DST or Timezone
 */
export function calculateNights(checkIn: string, checkOut: string): number {
    const start = parseAsUTC(checkIn);
    const end = parseAsUTC(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Normalize selection dates to ensure start <= end (handle reverse drag)
 */
export function normalizeSelectionDates(
    start: string,
    end: string
): { checkIn: string; checkOut: string } {
    return start <= end
        ? { checkIn: start, checkOut: end }
        : { checkIn: end, checkOut: start };
}



// Revert formatDateShort/Long to use parseISO for DISPLAY, as that's correct for "YYYY-MM-DD" -> "That Day Local".
// The issue was likely DIFFERENCE calculation crossing DST or timezone boundaries when using mismatched types.

/**
 * Format date for display (es. "Lun 20/01")
 */
export function formatDateShort(dateStr: string): string {
    return format(parseISO(dateStr), 'EEE dd/MM', { locale: it });
}

/**
 * Format date for display (es. "20 Gennaio 2026")
 */
export function formatDateLong(dateStr: string): string {
    return format(parseISO(dateStr), "d MMMM yyyy", { locale: it });
}

/**
 * Get all dates between start and end (inclusive)
 */
export function getDatesInRange(start: string, end: string): string[] {
    const days = calculateNights(start, end);
    const startDate = parseISO(start); // Use ISO for AddDays loop which is also safe locally
    return Array.from({ length: days + 1 }, (_, i) =>
        format(addDays(startDate, i), 'yyyy-MM-dd')
    );
}
