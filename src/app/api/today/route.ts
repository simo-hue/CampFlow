import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getTodayItaly } from '@/lib/utils';
import { addDays, format, parseISO, isValid } from 'date-fns';

/**
 * GET /api/today
 * 
 * Returns arrivals and departures for a specific date (default: today via query param)
 * Query params: ?date=YYYY-MM-DD
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Determine date range
        let startTargetDate = getTodayItaly();
        let endTargetDate = getTodayItaly();

        if (startDateParam && isValid(parseISO(startDateParam))) {
            startTargetDate = startDateParam;
            endTargetDate = endDateParam && isValid(parseISO(endDateParam)) ? endDateParam : startDateParam;
        } else if (dateParam && isValid(parseISO(dateParam))) {
            startTargetDate = dateParam;
            endTargetDate = dateParam;
        }

        const supabase = supabaseAdmin;

        // Get arrivals (bookings starting within range)
        const { data: allArrivals, error: arrivalsError } = await supabase
            .from('bookings')
            .select(`
                id,
                pitch_id,
                guests_count,
                booking_period,
                pitches!inner(number, suffix, type),
                customers!inner(first_name, last_name)
            `)
            .in('status', ['confirmed', 'checked_in'])
            .order('pitches(number)');

        if (arrivalsError) {
            console.error('Error fetching arrivals:', arrivalsError);
            return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 });
        }

        // Filter arrivals: start date falls within [startTargetDate, endTargetDate]
        const arrivals = allArrivals?.filter(booking => {
            const match = booking.booking_period?.match(/\[([^,]+),/);
            if (!match) return false;
            const arrivalDate = match[1];
            return arrivalDate >= startTargetDate && arrivalDate <= endTargetDate;
        }) || [];

        // Get departures (bookings ending within range)
        const { data: allDepartures, error: departuresError } = await supabase
            .from('bookings')
            .select(`
                id,
                pitch_id,
                guests_count,
                booking_period,
                pitches!inner(number, suffix, type),
                customers!inner(first_name, last_name)
            `)
            .in('status', ['checked_in', 'checked_out'])
            .order('pitches(number)');

        if (departuresError) {
            console.error('Error fetching departures:', departuresError);
            return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 });
        }

        // Filter departures: end date falls within [startTargetDate, endTargetDate]
        const departures = allDepartures?.filter(booking => {
            const match = booking.booking_period?.match(/,([^\)]+)\)/);
            if (!match) return false;
            const departureDate = match[1];
            return departureDate >= startTargetDate && departureDate <= endTargetDate;
        }) || [];

        return NextResponse.json({
            date: startTargetDate, // For backward compatibility
            startDate: startTargetDate,
            endDate: endTargetDate,
            arrivals,
            departures,
            total_arrivals: arrivals.length,
            total_departures: departures.length,
        });

    } catch (error) {
        console.error('Today API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
