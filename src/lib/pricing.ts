/**
 * Seasonal Pricing Calculator for CampFlow PMS
 * 
 * Pricing structure:
 * - High Season (June 1 - August 31): Premium rates
 * - Mid Season (May, September): Standard rates  
 * - Low Season (October - April): Discounted rates
 */

import type { PitchType } from '@/lib/types';

interface PricingRates {
    piazzola: number;
    tenda: number;
}

const HIGH_SEASON_RATES: PricingRates = {
    piazzola: 40,
    tenda: 25,
};

const MID_SEASON_RATES: PricingRates = {
    piazzola: 30,
    tenda: 20,
};

const LOW_SEASON_RATES: PricingRates = {
    piazzola: 20,
    tenda: 15,
};

/**
 * Determines if a date falls in high season (June-August)
 */
function isHighSeason(date: Date): boolean {
    const month = date.getUTCMonth(); // 0-indexed
    return month >= 5 && month <= 7; // June (5) - August (7)
}

/**
 * Determines if a date falls in mid season (May, September)
 */
function isMidSeason(date: Date): boolean {
    const month = date.getUTCMonth();
    return month === 4 || month === 8; // May (4) or September (8)
}

/**
 * Gets the daily rate for a specific date and pitch type
 */
function getDailyRate(date: Date, pitchType: PitchType): number {
    if (isHighSeason(date)) {
        return HIGH_SEASON_RATES[pitchType];
    } else if (isMidSeason(date)) {
        return MID_SEASON_RATES[pitchType];
    } else {
        return LOW_SEASON_RATES[pitchType];
    }
}

/**
 * Calculates the total price for a booking period
 * 
 * @param checkIn - Check-in date (YYYY-MM-DD or Date object)
 * @param checkOut - Check-out date (YYYY-MM-DD or Date object)
 * @param pitchType - Type of pitch
 * @returns Total price in EUR
 */
export function calculatePrice(
    checkIn: string | Date,
    checkOut: string | Date,
    pitchType: PitchType
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
        totalPrice += getDailyRate(currentDate, pitchType);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
}

/**
 * Gets a breakdown of the pricing calculation
 * Useful for displaying to users
 */
export function getPriceBreakdown(
    checkIn: string | Date,
    checkOut: string | Date,
    pitchType: PitchType
): {
    nights: number;
    averageRate: number;
    total: number;
    breakdown: { date: string; rate: number; season: string }[];
} {
    const startDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const endDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

    const breakdown: { date: string; rate: number; season: string }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        const rate = getDailyRate(currentDate, pitchType);
        let season = 'Low Season';
        if (isHighSeason(currentDate)) season = 'High Season';
        else if (isMidSeason(currentDate)) season = 'Mid Season';

        breakdown.push({
            date: currentDate.toISOString().split('T')[0],
            rate,
            season,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const total = breakdown.reduce((sum, day) => sum + day.rate, 0);
    const nights = breakdown.length;
    const averageRate = nights > 0 ? total / nights : 0;

    return {
        nights,
        averageRate: Math.round(averageRate * 100) / 100,
        total,
        breakdown,
    };
}
