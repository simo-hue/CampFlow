
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
        const supabase = supabaseAdmin;
        const { searchParams } = new URL(request.url);

        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const pitchType = searchParams.get('pitchType') as PitchType;

        const guestsStr = searchParams.get('guests');
        const childrenStr = searchParams.get('children');
        const dogsStr = searchParams.get('dogs');
        const carsStr = searchParams.get('cars');

        const guestsCount = guestsStr ? parseInt(guestsStr) : 0;
        const childrenCount = childrenStr ? parseInt(childrenStr) : 0;
        const dogsCount = dogsStr ? parseInt(dogsStr) : 0;
        const carsCount = carsStr ? parseInt(carsStr) : 0;
        const customerId = searchParams.get('customerId');


        if (!checkIn || !checkOut || !pitchType) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Fetch active seasons from DB
        const { data: seasons, error } = await supabase
            .from('pricing_seasons')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching seasons:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Fetch Customer Group Configuration (if customerId provided)
        let groupConfigs: any[] = [];
        if (customerId) {
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('group_id')
                .eq('id', customerId)
                .single();

            if (!customerError && customer?.group_id) {
                // Fetch configurations for this group
                const { data: configs, error: configError } = await supabase
                    .from('group_season_configurations')
                    .select('*')
                    .eq('group_id', customer.group_id);

                if (!configError && configs) {
                    groupConfigs = configs;
                }
            }
        }

        // Calculate
        const context = {
            seasons: seasons || [],
            guests: guestsCount,
            children: childrenCount,
            dogs: dogsCount,
            cars: carsCount,
            groupConfigs: groupConfigs.length > 0 ? groupConfigs : undefined
        };

        const totalPrice = calculatePrice(checkIn, checkOut, pitchType, context);
        const { breakdown, averageRate, nights } = getPriceBreakdown(checkIn, checkOut, pitchType, context);

        return NextResponse.json({
            totalPrice,
            breakdown,
            nights,
            averageRate
        });

    } catch (error: any) {
        console.error('Calculation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
