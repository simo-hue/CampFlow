import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/dev/performance
 * 
 * Returns database performance metrics:
 * - Active connections
 * - Cache hit ratio
 * - Query performance stats
 */
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .rpc('get_performance_metrics');

        if (error) {
            console.error('Error fetching performance metrics:', error);
            throw error;
        }

        return NextResponse.json({
            metrics: data?.[0] || {
                active_connections: 0,
                cache_hit_ratio: 0,
                avg_query_time_ms: 0
            }
        });

    } catch (error) {
        console.error('Performance metrics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch performance metrics' },
            { status: 500 }
        );
    }
}
