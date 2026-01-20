import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the current date in Italy (Europe/Rome) as a string YYYY-MM-DD
 * This ensures consistency regardless of where the server is running (UTC, etc.)
 */
export function getTodayItaly(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
}


/**
 * Formats a number as EUR currency using Italian locale
 * Example: 1000.50 -> "1.000,50 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
