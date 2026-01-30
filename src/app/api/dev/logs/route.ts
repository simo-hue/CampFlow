import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/dev/logs
 * 
 * Returns recent application logs with optional filtering
 * Query params:
 * - limit: number of logs to return (default 100)
 * - level: filter by log level (INFO, WARN, ERROR)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const level = searchParams.get('level');

        const { data, error } = await supabaseAdmin
            .rpc('get_recent_logs', {
                limit_count: limit,
                log_level: level || null
            });

        if (error) {
            console.error('Error fetching logs:', error);
            throw error;
        }

        return NextResponse.json({ logs: data || [] });

    } catch (error) {
        console.error('Logs API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/dev/logs
 * 
 * Cleanup old logs
 * Body: { daysToKeep: number }
 */
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const daysToKeep = body.daysToKeep || 60;

        const { data, error } = await supabaseAdmin
            .rpc('cleanup_old_logs', { days_to_keep: daysToKeep });

        if (error) {
            console.error('Error cleaning up logs:', error);
            throw error;
        }

        const result = data?.[0] || { deleted_count: 0, freed_space_estimate: '0 bytes' };

        return NextResponse.json({
            success: true,
            deletedCount: result.deleted_count,
            freedSpace: result.freed_space_estimate
        });

    } catch (error) {
        console.error('Cleanup logs API error:', error);
        return NextResponse.json(
            { error: 'Failed to cleanup logs' },
            { status: 500 }
        );
    }
}
