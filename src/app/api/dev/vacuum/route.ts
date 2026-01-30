import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/dev/vacuum
 * 
 * Runs VACUUM ANALYZE on all tables to reclaim space and update statistics
 */
export async function POST() {
    try {
        const { data, error } = await supabaseAdmin
            .rpc('vacuum_analyze_all');

        if (error) {
            console.error('Error running vacuum:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: data || 'Vacuum completed successfully'
        });

    } catch (error) {
        console.error('Vacuum API error:', error);
        return NextResponse.json(
            { error: 'Failed to run vacuum operation' },
            { status: 500 }
        );
    }
}
