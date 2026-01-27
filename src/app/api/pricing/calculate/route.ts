import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { PriceCalculation, PitchType } from '@/lib/types';
import { calculatePrice, getPriceBreakdown } from '@/lib/pricing';
import { parseISO, differenceInDays } from 'date-fns';

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



        // Calculate total price using shared logic
        const context = {
            seasons: seasons || [], // Pass empty array if no seasons (logic handles fallback/error)
            guests: guestsCount,
            children: childrenCount,
            dogs: dogsCount,
            cars: carsCount
        };

        try {
            const totalPrice = calculatePrice(checkIn, checkOut, pitchType, context);
            const breakdownData = getPriceBreakdown(checkIn, checkOut, pitchType, context);

            const result: PriceCalculation = {
                totalPrice,
                breakdown: breakdownData.breakdown,
                days: breakdownData.nights,
                averageRate: breakdownData.averageRate
            };

            return NextResponse.json(result);
        } catch (calcError) {
            console.error('Calculation error:', calcError);
            return NextResponse.json(
                { error: calcError instanceof Error ? calcError.message : 'Error calculating price' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Unexpected error in GET /api/pricing/calculate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


