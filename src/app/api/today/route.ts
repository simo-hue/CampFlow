import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getTodayItaly } from '@/lib/utils';

/**
 * GET /api/today
 * 
 * Returns arrivals and departures for today (Italy time)
 */
export async function GET() {
    try {
        const today = getTodayItaly(); // YYYY-MM-DD in Italy

        // Get arrivals (bookings starting today)
        // Fetch bookings that could start today and filter client-side
        const { data: allArrivals, error: arrivalsError } = await supabaseAdmin
            .from('bookings')
            .select(`
        id,
        pitch_id,
        guests_count,
        booking_period,
        pitches!inner(number, suffix, type),
        customers!inner(full_name)
      `)
            .in('status', ['confirmed', 'checked_in'])
            .order('pitches(number)');

        if (arrivalsError) {
            console.error('Error fetching arrivals:', arrivalsError);
            return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 });
        }

        // Filter arrivals to only those starting exactly today
        const arrivals = allArrivals?.filter(booking => {
            // Extract lower bound from daterange format: "[2026-01-18,2026-01-20)"
            const match = booking.booking_period?.match(/\[([^,]+),/);
            return match && match[1] === today;
        }) || [];

        // Get departures (bookings ending today)
        // Fetch bookings that could end today and filter client-side
        const { data: allDepartures, error: departuresError } = await supabaseAdmin
            .from('bookings')
            .select(`
        id,
        pitch_id,
        guests_count,
        booking_period,
        pitches!inner(number, suffix, type),
        customers!inner(full_name)
      `)
            .in('status', ['checked_in', 'checked_out'])
            .order('pitches(number)');

        if (departuresError) {
            console.error('Error fetching departures:', departuresError);
            return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 });
        }

        // Filter departures to only those ending exactly today
        const departures = allDepartures?.filter(booking => {
            // Extract upper bound from daterange format: "[2026-01-18,2026-01-20)"
            const match = booking.booking_period?.match(/,([^\)]+)\)/);
            return match && match[1] === today;
        }) || [];

        return NextResponse.json({
            date: today,
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
