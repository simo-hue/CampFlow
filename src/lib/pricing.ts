/**
 * Seasonal Pricing Calculator for CampFlow PMS
 * 
 * Pricing structure is now fully dynamic and based on the 'seasons' table in the database.
 * The Default Season (Stagione Base) acts as a fallback for any dates not covered by higher priority seasons.
 */

import type { PitchType, PricingSeason, GroupSeasonConfiguration, GroupBundle } from '@/lib/types';
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
    groupConfigs?: GroupSeasonConfiguration[]; // List of all seasonal configs for the group
    bundles?: GroupBundle[]; // List of price bundles
}

/**
 * Helper to check if a service is included (zero-rated)
 */
function isIncluded(service: string, includedServices?: string[]): boolean {
    if (!includedServices) return false;
    return includedServices.includes(service);
}

/**
 * Gets the daily rate for a specific date, pitch type, and extra variables
 * Supports "zero-rating" specific items if they are included in a bundle
 */
export function getDailyRate(
    date: Date,
    pitchType: PitchType,
    context: CalculationContext,
    zeroRatedItems: string[] = [],
    bundleUnitPrices?: Record<string, number>,
    bundleDuration?: number
): { total: number; seasonName: string; seasonColor: string } {
    const season = getApplicableSeason(date, context.seasons);

    if (!season) {
        return {
            total: 0,
            seasonName: 'Nessuna Stagione',
            seasonColor: '#94a3b8'
        };
    }

    let dailyTotal = 0;
    const config = context.groupConfigs?.find(c => c.season_id === season.id);

    const rates = {
        piazzola: config?.custom_rates?.piazzola ?? season.piazzola_price_per_day,
        tenda: config?.custom_rates?.tenda ?? season.tenda_price_per_day,
        person: config?.custom_rates?.person ?? season.person_price_per_day,
        child: config?.custom_rates?.child ?? season.child_price_per_day,
        dog: config?.custom_rates?.dog ?? season.dog_price_per_day,
        car: config?.custom_rates?.car ?? season.car_price_per_day,
    };

    // Helper to determine cost: either Seasonal Rate OR Bundle Unit Price (prorated)
    const getCost = (item: string, count: number, standardRate: number) => {
        if (count <= 0) return 0;

        // If bundle defines a price for this item, use it (PRORATED per day)
        if (bundleUnitPrices && bundleUnitPrices[item] !== undefined && bundleDuration) {
            return count * (bundleUnitPrices[item] / bundleDuration);
        }

        // Otherwise use standard seasonal rate (or custom group rate)
        // CHECK if zero-rated (e.g. pitch in bundle)
        if (isIncluded(item, zeroRatedItems)) return 0;

        return count * standardRate;
    };

    // Pitch
    if (pitchType === 'piazzola') {
        dailyTotal += getCost('piazzola', 1, rates.piazzola);
    } else {
        // Tenda: if bundled, usually covered by base price. If not, check rate.
        // Assuming bundle base covers main unit.
        if (bundleUnitPrices && bundleDuration) {
            // If active bundle, Pitch/Tenda is covered by base price (handled in caller)
        } else {
            dailyTotal += getCost('tenda', 1, rates.tenda);
        }
    }

    // Extras
    dailyTotal += getCost('person', context.guests || 0, rates.person || 0);
    dailyTotal += getCost('child', context.children || 0, rates.child || 0);
    dailyTotal += getCost('dog', context.dogs || 0, rates.dog || 0);
    dailyTotal += getCost('car', context.cars || 0, rates.car || 0);

    // Apply Percentage Discount (ONLY on standard rates, NOT on bundle prices?)
    // Usually bundles are net prices. Discount applies to standard parts? 
    // Plan: "If checked, show Input for Price... these values represent total cost... not per day".
    // So bundle prices are FIXED and likely NOT subject to further % discount.
    // Standard rates might be.
    // Complexity: Differentiating likely needs tracking which part is standard.
    // Simplifying: If Bundle is Active, NO percentage discount on top of Bundle Prices.
    // But what about Non-Bundle items (e.g. extra dog)?
    // Current logic applies discount to `dailyTotal`. 
    // Let's assume Discount % applies to EVERYTHING not fixed by bundle?
    // User requirement: "Price of every single service must be persistent".
    // Implies fixed agreed price. 
    // So: DO NOT apply discount if a bundle price was used.
    // Hard to split in this single return total. 
    // Compromise: If a Bundle is active for the day, maybe disable generic percentage discount?
    // Or apply it only if no specific bundle price?
    // Let's keep existing logic but realize `getCost` returns mixed.
    // Better: Only apply discount if `!bundleUnitPrices`? 
    // Or apply discount `if (config?.discount_percentage)` but `activeBundle` logic might override.

    // For now: Apply discount to the calculated total. If bundle price is 5 euro, and discount 10%, it becomes 4.5.
    // This might be unintended.
    // FIX: Only apply discount to standard rates.
    // We already moved to `getCost`.

    if (config?.discount_percentage && config.discount_percentage > 0 && !bundleUnitPrices) {
        const discountAmount = (dailyTotal * config.discount_percentage) / 100;
        dailyTotal -= discountAmount;
    }

    return {
        total: Math.max(0, dailyTotal),
        seasonName: season.name,
        seasonColor: season.color
    };
}

/**
 * Finds the best applicable bundle for the stay duration
 */
function getBestBundle(durationDays: number, bundles?: GroupBundle[]): GroupBundle | undefined {
    if (!bundles || bundles.length === 0) return undefined;

    // Sort bundles by nights desc
    // We want the largest bundle that fits into the stay? 
    // Requirement: "if they stay 4 nights, first 2 discounted... then remaining"
    // So we just find the LARGEST bundle that is <= duration.
    const validBundles = bundles.filter(b => b.nights <= durationDays);
    if (validBundles.length === 0) return undefined; // No bundle applies (stay too short)

    // Sort by nights desc to get the longest applicable bundle
    validBundles.sort((a, b) => b.nights - a.nights);
    return validBundles[0];
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

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Determine applicable season for Check-In
    const checkInSeason = getApplicableSeason(startDate, context.seasons);

    // Filter bundles for this season
    const seasonBundles = context.bundles?.filter(b => b.season_id === checkInSeason?.id);

    // Check for Bundle: Pass ONLY bundles for the current season
    const activeBundle = getBestBundle(durationDays, seasonBundles);

    let totalPrice = 0;
    const currentDate = new Date(startDate);
    let daysProcessed = 0;

    while (currentDate < endDate) {
        daysProcessed++;

        let dayCost = 0;
        let zeroRated: string[] = [];
        let bundleDailyBase = 0;
        let bundleUnitPrices: Record<string, number> | undefined = undefined;

        if (activeBundle && daysProcessed <= activeBundle.nights) {
            // APPLY BUNDLE
            // Pitch price INCLUDES people (adults/children). Only dog/car are extras if not in unit_prices.
            zeroRated = ['piazzola', 'person', 'child'];

            // Prorate base price
            bundleDailyBase = activeBundle.pitch_price / activeBundle.nights;

            // Set unit prices for this bundle duration
            bundleUnitPrices = activeBundle.unit_prices;
        }

        const { total: extrasTotal } = getDailyRate(
            currentDate,
            pitchType,
            context,
            zeroRated,
            bundleUnitPrices,
            activeBundle ? activeBundle.nights : undefined
        );

        dayCost = bundleDailyBase + extrasTotal;
        totalPrice += dayCost;

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
    breakdown: { date: string; rate: number; seasonName: string; seasonColor: string, isBundle?: boolean }[];
} {
    const startDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const endDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

    const breakdown: { date: string; rate: number; seasonName: string; seasonColor: string, isBundle?: boolean }[] = [];
    const currentDate = new Date(startDate);

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const checkInSeason = getApplicableSeason(startDate, context.seasons);
    const seasonBundles = context.bundles?.filter(b => b.season_id === checkInSeason?.id);
    const activeBundle = getBestBundle(durationDays, seasonBundles);

    let daysProcessed = 0;

    while (currentDate < endDate) {
        daysProcessed++;

        let zeroRated: string[] = [];
        let bundleDailyPart = 0;
        let isBundleDay = false;
        let effectiveSeasonName = "";
        let effectiveSeasonColor = "";

        if (activeBundle && daysProcessed <= activeBundle.nights) {
            // APPLY BUNDLE
            // Pitch price INCLUDES people (adults/children). Only dog/car are extras if not in unit_prices.
            zeroRated = ['piazzola', 'person', 'child'];
            bundleDailyPart = activeBundle.pitch_price / activeBundle.nights;
            isBundleDay = true;

            // Pass active bundle context to getDailyRate for unit prices
        }

        const { total: extrasTotal, seasonName, seasonColor } = getDailyRate(
            currentDate,
            pitchType,
            context,
            zeroRated,
            (isBundleDay && activeBundle) ? activeBundle.unit_prices : undefined,
            (isBundleDay && activeBundle) ? activeBundle.nights : undefined
        );

        effectiveSeasonName = seasonName;
        effectiveSeasonColor = seasonColor;

        if (isBundleDay) {
            effectiveSeasonName = `Offerta ${activeBundle!.nights} Notti`; // Overlay name
            effectiveSeasonColor = '#8b5cf6'; // Purple regarding "Bundle"
        }

        const dayTotal = bundleDailyPart + extrasTotal;

        breakdown.push({
            date: currentDate.toISOString().split('T')[0],
            rate: parseFloat(dayTotal.toFixed(2)),
            seasonName: effectiveSeasonName,
            seasonColor: effectiveSeasonColor,
            isBundle: isBundleDay
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
