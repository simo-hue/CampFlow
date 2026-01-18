import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { DashboardStats } from '@/lib/types';
import { getTodayItaly } from '@/lib/utils';

/**
 * GET /api/stats
 * 
 * Returns real-time dashboard statistics:
 * - Arrivals today (check-ins)
 * - Departures today (check-outs)
 * - Current occupancy count and percentage
 */
export async function GET() {
    try {
        const today = getTodayItaly(); // YYYY-MM-DD in Italy

        // Get arrivals today: bookings where lower(booking_period)::date = today
        const { data: arrivalsData, error: arrivalsError } = await supabaseAdmin
            .rpc('count_arrivals_today', { target_date: today });

        if (arrivalsError) {
            console.error('Error fetching arrivals:', arrivalsError);
        }

        // Get departures today: bookings where upper(booking_period)::date = today
        const { data: departuresData, error: departuresError } = await supabaseAdmin
            .rpc('count_departures_today', { target_date: today });

        if (departuresError) {
            console.error('Error fetching departures:', departuresError);
        }

        // Get current occupancy: active bookings where booking_period contains today
        const { count: occupancyCount, error: occupancyError } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .in('status', ['confirmed', 'checked_in'])
            .contains('booking_period', today);

        if (occupancyError) {
            console.error('Error fetching occupancy:', occupancyError);
        }

        // Get total pitches count from database
        const { count: totalPitchesCount, error: pitchesError } = await supabaseAdmin
            .from('pitches')
            .select('*', { count: 'exact', head: true })
            .in('status', ['available', 'maintenance', 'blocked']);

        if (pitchesError) {
            console.error('Error fetching total pitches:', pitchesError);
        }

        const totalPitches = totalPitchesCount || 0;
        const currentOccupancy = occupancyCount || 0;
        const occupancyPercentage = totalPitches > 0
            ? Math.round((currentOccupancy / totalPitches) * 100)
            : 0;

        const stats: DashboardStats = {
            arrivals_today: arrivalsData || 0,
            departures_today: departuresData || 0,
            current_occupancy: currentOccupancy,
            occupancy_percentage: occupancyPercentage,
            total_pitches: totalPitches,
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
