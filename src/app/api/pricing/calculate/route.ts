import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { PriceCalculation, PriceBreakdownDay, PitchType } from '@/lib/types';
import { parseISO, addDays, differenceInDays, format } from 'date-fns';

/**
 * GET /api/pricing/calculate?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&pitchType=piazzola|tenda
 * Calculate total price for a stay period based on seasonal pricing
 * 
 * Handles overlapping seasons with priority-based resolution
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const pitchType = searchParams.get('pitchType') as PitchType;

        const guestsStr = searchParams.get('guests');
        const childrenStr = searchParams.get('children');
        const dogsStr = searchParams.get('dogs');
        const carsStr = searchParams.get('cars');
        const guestPriceStr = searchParams.get('guestPrice');
        const childPriceStr = searchParams.get('childPrice');
        const dogPriceStr = searchParams.get('dogPrice');
        const carPriceStr = searchParams.get('carPrice');

        const guestsCount = guestsStr ? parseInt(guestsStr) : 0;
        const childrenCount = childrenStr ? parseInt(childrenStr) : 0;
        const dogsCount = dogsStr ? parseInt(dogsStr) : 0;
        const carsCount = carsStr ? parseInt(carsStr) : 0;
        const guestPrice = guestPriceStr ? parseFloat(guestPriceStr) : 0;
        const childPrice = childPriceStr ? parseFloat(childPriceStr) : 0;
        const dogPrice = dogPriceStr ? parseFloat(dogPriceStr) : 0;
        const carPrice = carPriceStr ? parseFloat(carPriceStr) : 0;

        // Calculate daily extra cost
        // Guests usually means ADULTS in the UI now, but API param name kept as guests for consistency with frontend hook
        const dailyExtraCost = (guestsCount * guestPrice) + (childrenCount * childPrice) + (dogsCount * dogPrice) + (carsCount * carPrice);

        // Validation
        if (!checkIn || !checkOut || !pitchType) {
            return NextResponse.json(
                { error: 'Missing required parameters: checkIn, checkOut, pitchType' },
                { status: 400 }
            );
        }

        if (pitchType !== 'piazzola' && pitchType !== 'tenda') {
            return NextResponse.json(
                { error: 'Invalid pitchType. Must be "piazzola" or "tenda"' },
                { status: 400 }
            );
        }

        const startDate = parseISO(checkIn);
        const endDate = parseISO(checkOut);

        // Handle same-day selection (1 day charge)
        const days = checkIn === checkOut ? 1 : differenceInDays(endDate, startDate);

        if (days < 0) {
            return NextResponse.json(
                { error: 'Check-out must be after or equal to check-in' },
                { status: 400 }
            );
        }

        // Fetch all active seasons
        const supabase = supabaseAdmin;
        const { data: seasons, error } = await supabase
            .from('pricing_seasons')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pricing seasons:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pricing data' },
                { status: 500 }
            );
        }

        if (!seasons || seasons.length === 0) {
            // Fallback to default pricing if no seasons configured
            const defaultRate = pitchType === 'piazzola' ? 25 : 18;
            const finalDailyRate = defaultRate + dailyExtraCost;
            const totalPrice = finalDailyRate * days;

            return NextResponse.json({
                totalPrice,
                days,
                averageRate: finalDailyRate,
                breakdown: Array.from({ length: days }, (_, i) => ({
                    date: format(addDays(startDate, i), 'yyyy-MM-dd'),
                    rate: finalDailyRate,
                    seasonName: 'Tariffa Standard',
                    seasonColor: '#3b82f6'
                }))
            });
        }

        // Calculate price for each day
        const breakdown: PriceBreakdownDay[] = [];
        let totalPrice = 0;

        for (let i = 0; i < days; i++) {
            const currentDate = addDays(startDate, i);
            const currentDateStr = format(currentDate, 'yyyy-MM-dd');

            // Find the highest priority season that covers this date
            const applicableSeason = findSeasonForDate(currentDateStr, seasons);

            if (applicableSeason) {
                const baseRate = pitchType === 'piazzola'
                    ? applicableSeason.piazzola_price_per_day
                    : applicableSeason.tenda_price_per_day;

                const finalRate = baseRate + dailyExtraCost;

                breakdown.push({
                    date: currentDateStr,
                    rate: finalRate,
                    seasonName: applicableSeason.name,
                    seasonColor: applicableSeason.color
                });

                totalPrice += finalRate;
            } else {
                // Fallback rate if no season covers this date
                const fallbackRate = pitchType === 'piazzola' ? 25 : 18;
                const finalRate = fallbackRate + dailyExtraCost;

                breakdown.push({
                    date: currentDateStr,
                    rate: finalRate,
                    seasonName: 'Tariffa Standard',
                    seasonColor: '#6b7280'
                });
                totalPrice += finalRate;
            }
        }

        const averageRate = days > 0 ? totalPrice / days : 0;

        const result: PriceCalculation = {
            totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
            breakdown,
            days,
            averageRate: Math.round(averageRate * 100) / 100
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Unexpected error in GET /api/pricing/calculate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Helper: Find the applicable season for a specific date
 * Priority: Higher priority wins, then newer season wins
 */
function findSeasonForDate(date: string, seasons: any[]): any | null {
    const targetDate = parseISO(date);

    // Find all seasons that cover this date
    const matchingSeasons = seasons.filter(season => {
        const start = parseISO(season.start_date);
        const end = parseISO(season.end_date);
        return targetDate >= start && targetDate <= end;
    });

    if (matchingSeasons.length === 0) {
        return null;
    }

    // Already sorted by priority DESC, created_at DESC
    // So first match is the winner
    return matchingSeasons[0];
}
