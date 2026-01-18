import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { DashboardStats } from '@/lib/types';

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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

        // Get current occupancy: active bookings where booking_period contains NOW()
        const { count: occupancyCount, error: occupancyError } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .in('status', ['confirmed', 'checked_in'])
            .contains('booking_period', new Date().toISOString());

        if (occupancyError) {
            console.error('Error fetching occupancy:', occupancyError);
        }

        const TOTAL_PITCHES = 300;
        const currentOccupancy = occupancyCount || 0;
        const occupancyPercentage = Math.round((currentOccupancy / TOTAL_PITCHES) * 100);

        const stats: DashboardStats = {
            arrivals_today: arrivalsData || 0,
            departures_today: departuresData || 0,
            current_occupancy: currentOccupancy,
            occupancy_percentage: occupancyPercentage,
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
