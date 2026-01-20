'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Persists a log entry to the Supabase database.
 * This is a Server Action/Function ensuring it runs only on the server.
 */
export async function logToDb(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
    try {
        const supabase = supabaseAdmin;

        const { error } = await supabase.from('app_logs').insert({
            level,
            message,
            meta,
            environment: process.env.NODE_ENV || 'unknown',
            timestamp: new Date().toISOString(),
        });

        if (error) {
            console.error('Supabase Logging Error:', error.message);
        }

        // Probabilistic Cleanup (10% chance)
        // Fire and forget - don't await this to avoid slowing down the request
        if (Math.random() < 0.1) {
            cleanupOldLogs().catch(err => console.error('Auto-cleanup failed:', err));
        }

    } catch (err) {
        console.error('Unexpected error writing to log table:', err);
    }
}

/**
 * Manually trigger cleanup of logs older than 30 days.
 */
export async function cleanupOldLogs() {
    try {
        const supabase = supabaseAdmin;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { error, count } = await supabase
            .from('app_logs')
            .delete({ count: 'exact' })
            .lt('timestamp', thirtyDaysAgo.toISOString());

        if (error) throw error;

        return { success: true, count };
    } catch (err: any) {
        console.error('Cleanup Error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Manually trigger cleanup of ALL logs.
 */
export async function clearAllLogs() {
    try {
        const supabase = supabaseAdmin;

        const { error, count } = await supabase
            .from('app_logs')
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to match all rows since we can't delete without a filter easily in some configs, or just use a dummy filter. 
        // Actually, usually Supabase requires a WHERE clause for delete. `neq` on ID is a safe way to select "everything".

        if (error) throw error;

        return { success: true, count };
    } catch (err: any) {
        console.error('Clear All Error:', err);
        return { success: false, error: err.message };
    }
}
