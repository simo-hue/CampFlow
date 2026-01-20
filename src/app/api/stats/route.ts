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

        // Call the optimized RPC function
        const { data, error } = await supabaseAdmin
            .rpc('get_dashboard_stats', { target_date: today });

        if (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }

        // data is returned as an array of objects, take the first one
        const statsRow = data && data[0] ? data[0] : {
            arrivals_today: 0,
            departures_today: 0,
            current_occupancy: 0,
            total_pitches: 0
        };

        const totalPitches = statsRow.total_pitches || 0;
        const currentOccupancy = statsRow.current_occupancy || 0;
        const occupancyPercentage = totalPitches > 0
            ? Math.round((Number(currentOccupancy) / Number(totalPitches)) * 100)
            : 0;

        const stats: DashboardStats = {
            arrivals_today: statsRow.arrivals_today || 0,
            departures_today: statsRow.departures_today || 0,
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
