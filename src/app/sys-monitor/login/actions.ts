'use server';

import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'sys_monitor_auth';

export async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
        return { error: 'Server authentication is not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD env vars.' };
    }

    if (username === validUsername && password === validPassword) {
        // Set a simple auth cookie (HTTP-only)
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        redirect('/sys-monitor');
    } else {
        return { error: 'Invalid Credentials' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect('/sys-monitor/login');
}

export async function getAuthStatus() {
    const cookieStore = await cookies();
    return cookieStore.has(AUTH_COOKIE_NAME);
}

import { cleanupOldLogs } from '@/lib/logger-server';
import { revalidatePath } from 'next/cache';

export async function cleanLogsAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const result = await cleanupOldLogs();
    revalidatePath('/sys-monitor');
    return result;
}

import { clearAllLogs } from '@/lib/logger-server';

export async function clearAllLogsAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const result = await clearAllLogs();
    revalidatePath('/sys-monitor');
    return result;
}

import { supabaseAdmin } from '@/lib/supabase/server';
import { DEFAULT_PITCHES, DEFAULT_SEASONS } from '@/lib/seed-data';

export async function resetSystemAction() {
    // 1. Double check auth
    const isAuthed = await getAuthStatus();
    if (!isAuthed) {
        throw new Error('Unauthorized');
    }

    const supabase = supabaseAdmin;

    try {
        // 2. Delete Transactional Data (Order matters for FK)
        // Booking Guests (via cascade from bookings usually, but manual to be safe)
        // Bookings
        await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Customers/Guests
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Logs
        await supabase.from('app_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Reset Configuration
        // Delete existing pitches and seasons
        await supabase.from('pitches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pricing_seasons').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Restore Defaults
        // Insert Pitches
        const { error: pitchError } = await supabase.from('pitches').insert(DEFAULT_PITCHES);
        if (pitchError) throw new Error(`Failed to restore pitches: ${pitchError.message}`);

        // Insert Seasons
        const { error: seasonError } = await supabase.from('pricing_seasons').insert(DEFAULT_SEASONS);
        if (seasonError) throw new Error(`Failed to restore seasons: ${seasonError.message}`);

        revalidatePath('/');
        return { success: true, message: 'System successfully reset to factory defaults.' };
    } catch (error: any) {
        logger.error('System Reset Failed:', { error });
        return { success: false, error: error.message };
    }
}

export async function clearBookingsAction() {
    // 1. Double check auth
    const isAuthed = await getAuthStatus();
    if (!isAuthed) {
        throw new Error('Unauthorized');
    }

    console.log('[ClearBookings] Starting...');
    const supabase = supabaseAdmin;

    try {
        // Delete Transactional Data
        // Booking Guests (via cascade usually, but explicit is safer/cleaner to document intent)
        // Bookings
        await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Also clean Customers if desired? The prompt says "cancellare tutte le prenotazioni".
        // Usually clearing bookings implies clearing customers too in a "reset" scenario, but "Clear Bookings" might imply keeping the customer registry.
        // However, looking at the previous System Reset, it cleared Customers too.
        // If I clear bookings, I probably should clear customers associated with them if they have no other bookings, but that's complex.
        // The user asked for "cancellare tutte le prenotazioni" (delete all bookings).
        // I will stick to deleting bookings. If customers are left dangling, that might be okay for a "Clear Bookings" action, or I can delete them too.
        // Let's assume just bookings for now unless I see a reason to wipe customers. 
        // Actually, if I delete bookings, the customers remain. That seems correct for "delete bookings".
        // Use case: keeping the customer database but clearing the schedule for a new season.

        revalidatePath('/');
        console.log('[ClearBookings] Success');
        return { success: true, message: 'All bookings have been successfully deleted.' };
    } catch (error: any) {
        logger.error('Clear Bookings Failed:', { error });
        return { success: false, error: error.message };
    }
}

export async function clearCustomersAction() {
    // 1. Double check auth
    const isAuthed = await getAuthStatus();
    if (!isAuthed) {
        throw new Error('Unauthorized');
    }

    console.log('[ClearCustomers] Starting...');
    const supabase = supabaseAdmin;

    try {
        // Delete Customers (will cascade to Bookings)
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        revalidatePath('/');
        console.log('[ClearCustomers] Success');
        return { success: true, message: 'All customers (and their bookings) have been successfully deleted.' };
    } catch (error: any) {
        logger.error('Clear Customers Failed:', { error });
        return { success: false, error: error.message };
    }
}

export async function clearPitchesAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const supabase = supabaseAdmin;
    try {
        await supabase.from('pitches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        revalidatePath('/');
        return { success: true, message: 'All pitches have been successfully deleted.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function clearSeasonsAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const supabase = supabaseAdmin;
    try {
        await supabase.from('pricing_seasons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        revalidatePath('/');
        return { success: true, message: 'All pricing seasons have been successfully deleted.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function seedPitchesAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const supabase = supabaseAdmin;
    try {
        const { error } = await supabase.from('pitches').insert(DEFAULT_PITCHES);
        if (error) throw error;
        revalidatePath('/');
        return { success: true, message: 'Default pitches seeded successfully.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function seedSeasonsAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');
    const supabase = supabaseAdmin;
    try {
        const { error } = await supabase.from('pricing_seasons').insert(DEFAULT_SEASONS);
        if (error) throw error;
        revalidatePath('/');
        return { success: true, message: 'Default seasons seeded successfully.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateBackupAction(selectedTables?: string[]) {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');

    const supabase = supabaseAdmin;

    try {
        const allTables = [
            'customers',
            'bookings',
            'booking_guests',
            'pitches',
            'sectors',
            'pricing_seasons',
            'customer_groups',
            'group_season_configuration',
            'group_bundles',
            'app_logs'
        ];

        const tablesToBackup = selectedTables && selectedTables.length > 0 
            ? selectedTables.filter(t => allTables.includes(t))
            : allTables;

        const backupData: Record<string, any> = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            tables_included: tablesToBackup,
            data: {}
        };

        for (const table of tablesToBackup) {
            // Check if table exists by trying to select 0 rows
            const { error: checkError } = await supabase.from(table).select('id').limit(0);
            if (checkError) {
                console.warn(`Table ${table} might not exist or is not accessible:`, checkError.message);
                continue;
            }

            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.warn(`Could not backup table ${table}:`, error.message);
                continue;
            }
            backupData.data[table] = data;
        }

        return { success: true, backup: backupData };
    } catch (error: any) {
        logger.error('Backup generation failed:', { error });
        return { success: false, error: error.message };
    }
}


export async function fetchStatsAction() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) throw new Error('Unauthorized');

    const supabase = supabaseAdmin;
    let totalSize: number | null = null;
    let counts = {
        customers: 0,
        bookings: 0,
        logs: 0,
        pitches: 0
    };
    let source: 'rpc' | 'fallback' = 'fallback';

    try {
        const { data: storageData } = await supabase.rpc('get_storage_stats');
        if (storageData && Array.isArray(storageData)) {
            totalSize = storageData.reduce((acc, curr: any) => acc + (Number(curr.total_size_bytes) || 0), 0);
        }

        const { data: dbStats, error: rpcError } = await supabase.rpc('get_db_stats');
        if (!rpcError && dbStats) {
            const stats = Array.isArray(dbStats) ? dbStats[0] : dbStats;
            if (stats) {
                counts.bookings = Number(stats.total_bookings || stats.bookings) || 0;
                counts.customers = Number(stats.total_customers || stats.customers) || 0;
                counts.pitches = Number(stats.total_pitches || stats.pitches) || 0;
                source = 'rpc';
            }
        }
    } catch (e) {}

    try {
        if (source === 'fallback') {
            const [
                { count: customers },
                { count: bookings },
                { count: logs },
                { count: pitches }
            ] = await Promise.all([
                supabase.from('customers').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('app_logs').select('*', { count: 'exact', head: true }),
                supabase.from('pitches').select('*', { count: 'exact', head: true })
            ]);
            counts.customers = customers || 0;
            counts.bookings = bookings || 0;
            counts.logs = logs || 0;
            counts.pitches = pitches || 0;
        } else {
            const { count: logsCount } = await supabase.from('app_logs').select('*', { count: 'exact', head: true });
            counts.logs = logsCount || 0;
        }
    } catch (e) {}

    return {
        success: true,
        data: {
            sizeBytes: totalSize,
            ...counts,
            source,
            timestamp: new Date().toISOString()
        }
    };
}
