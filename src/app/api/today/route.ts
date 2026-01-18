import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/today
 * 
 * Returns arrivals and departures for today
 */
export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Get arrivals (bookings starting today)
        const { data: arrivals, error: arrivalsError } = await supabaseAdmin
            .from('bookings')
            .select(`
        id,
        pitch_id,
        guests_count,
        pitches!inner(number),
        customers!inner(full_name)
      `)
            .eq(supabaseAdmin.raw('lower(booking_period)'), today)
            .in('status', ['confirmed', 'checked_in'])
            .order('pitches(number)');

        if (arrivalsError) {
            console.error('Error fetching arrivals:', arrivalsError);
            return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 });
        }

        // Get departures (bookings ending today)
        const { data: departures, error: departuresError } = await supabaseAdmin
            .from('bookings')
            .select(`
        id,
        pitch_id,
        guests_count,
        pitches!inner(number),
        customers!inner(full_name)
      `)
            .eq(supabaseAdmin.raw('upper(booking_period)'), today)
            .in('status', ['checked_in', 'checked_out'])
            .order('pitches(number)');

        if (departuresError) {
            console.error('Error fetching departures:', departuresError);
            return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 });
        }

        return NextResponse.json({
            date: today,
            arrivals: arrivals || [],
            departures: departures || [],
            total_arrivals: arrivals?.length || 0,
            total_departures: departures?.length || 0,
        });

    } catch (error) {
        console.error('Today API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
