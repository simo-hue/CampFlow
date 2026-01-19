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
        const queryDate = searchParams.get('date');

        // Use provided date or default to today (Italy time)
        let targetDate = getTodayItaly();
        if (queryDate && isValid(parseISO(queryDate))) {
            targetDate = queryDate;
        }

        const supabase = supabaseAdmin;

        // Get arrivals (bookings starting on targetDate)
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

        // Filter arrivals to only those starting exactly on targetDate
        // Format in DB is "[YYYY-MM-DD,YYYY-MM-DD)"
        const arrivals = allArrivals?.filter(booking => {
            const match = booking.booking_period?.match(/\[([^,]+),/);
            return match && match[1] === targetDate;
        }) || [];

        // Get departures (bookings ending on targetDate)
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

        // Filter departures to only those ending exactly on targetDate
        const departures = allDepartures?.filter(booking => {
            const match = booking.booking_period?.match(/,([^\)]+)\)/);
            return match && match[1] === targetDate;
        }) || [];

        return NextResponse.json({
            date: targetDate,
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
