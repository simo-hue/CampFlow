import { parseISO, differenceInDays, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: string, start: string, end: string): boolean {
    const d = parseISO(date);
    const s = parseISO(start);
    const e = parseISO(end);
    return d >= s && d <= e;
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    return differenceInDays(end, start);
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
    const normalized = normalizeSelectionDates(start, end);
    const startDate = parseISO(normalized.checkIn);
    const endDate = parseISO(normalized.checkOut);
    const nights = differenceInDays(endDate, startDate);

    return Array.from({ length: nights + 1 }, (_, i) =>
        format(addDays(startDate, i), 'yyyy-MM-dd')
    );
}
