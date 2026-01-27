/**
/**
 * Seasonal Pricing Calculator for CampFlow PMS
 * 
 * Pricing structure is now fully dynamic and based on the 'seasons' table in the database.
 * The Default Season (Stagione Base) acts as a fallback for any dates not covered by higher priority seasons.
 */

import type { PitchType, PricingSeason } from '@/lib/types';
import { isWithinInterval, parseISO } from 'date-fns';

/**
 * Gets the applicable season for a specific date
 * Returns the active season with the highest priority that covers the date.
 * If no season is found, returns undefined (caller should handle fallback or ensure default season exists).
 */
export function getApplicableSeason(date: Date, seasons: PricingSeason[]): PricingSeason | undefined {
    // Filter seasons that cover the date and are active
    const applicableSeasons = seasons.filter(season => {
        if (!season.is_active) return false;
        const start = parseISO(season.start_date);
        const end = parseISO(season.end_date);
        return isWithinInterval(date, { start, end });
    });

    // Sort by priority (descending) -> highest priority first
    applicableSeasons.sort((a, b) => b.priority - a.priority);

    return applicableSeasons[0];
}

/**
 * Calculations context
 */
export interface CalculationContext {
    seasons: PricingSeason[];
    guests?: number;
    children?: number;
    dogs?: number;
    cars?: number;
}

/**
 * Gets the daily rate for a specific date, pitch type, and extra variables
 */
function getDailyRate(date: Date, pitchType: PitchType, context: CalculationContext): { total: number; seasonName: string; seasonColor: string } {
    const season = getApplicableSeason(date, context.seasons);

    if (!season) {
        // Fallback if no season covers the date (should rarely happen if Default Season is set)
        return {
            total: 0,
            seasonName: 'Nessuna Stagione',
            seasonColor: '#94a3b8'
        };
    }

    let dailyTotal = 0;

    // Pitch Price
    if (pitchType === 'piazzola') {
        dailyTotal += season.piazzola_price_per_day;
    } else {
        dailyTotal += season.tenda_price_per_day;
    }

    // Extra variables
    if (context.guests) dailyTotal += context.guests * (season.person_price_per_day ?? 0);
    if (context.children) dailyTotal += context.children * (season.child_price_per_day ?? 0);
    if (context.dogs) dailyTotal += context.dogs * (season.dog_price_per_day ?? 0);
    if (context.cars) dailyTotal += context.cars * (season.car_price_per_day ?? 0);

    return {
        total: dailyTotal,
        seasonName: season.name,
        seasonColor: season.color
    };
}

/**
 * Calculates the total price for a booking period
 */
export function calculatePrice(
    checkIn: string | Date,
    checkOut: string | Date,
    pitchType: PitchType,
    context: CalculationContext
): number {
    const startDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const endDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

    // Validate dates
    if (startDate >= endDate) {
        throw new Error('Check-out date must be after check-in date');
    }

    let totalPrice = 0;
    const currentDate = new Date(startDate);

    // Calculate price for each night
    while (currentDate < endDate) {
        const { total } = getDailyRate(currentDate, pitchType, context);
        totalPrice += total;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return parseFloat(totalPrice.toFixed(2));
}

/**
 * Gets a breakdown of the pricing calculation
 */
export function getPriceBreakdown(
    checkIn: string | Date,
    checkOut: string | Date,
    pitchType: PitchType,
    context: CalculationContext
): {
    nights: number;
    averageRate: number;
    total: number;
    breakdown: { date: string; rate: number; seasonName: string; seasonColor: string }[];
} {
    const startDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const endDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

    const breakdown: { date: string; rate: number; seasonName: string; seasonColor: string }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        const { total, seasonName, seasonColor } = getDailyRate(currentDate, pitchType, context);

        breakdown.push({
            date: currentDate.toISOString().split('T')[0],
            rate: parseFloat(total.toFixed(2)),
            seasonName,
            seasonColor,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const total = breakdown.reduce((sum, day) => sum + day.rate, 0);
    const nights = breakdown.length;
    const averageRate = nights > 0 ? total / nights : 0;

    return {
        nights,
        averageRate: Math.round(averageRate * 100) / 100,
        total: parseFloat(total.toFixed(2)),
        breakdown,
    };
}
