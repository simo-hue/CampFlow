import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/dev/db-stats
 * 
 * Returns ACCURATE database statistics using PostgreSQL native functions
 * Falls back to estimates if SQL function is not deployed
 */
export async function GET() {
    try {
        // Try to get ACCURATE sizes using PostgreSQL native function
        const { data: storageData, error: storageError } = await supabaseAdmin
            .rpc('get_storage_stats');

        if (!storageError && storageData) {
            // SUCCESS: We have accurate data from PostgreSQL
            return handleAccurateData(storageData);
        }

        // FALLBACK: Use estimates if function doesn't exist
        console.warn('get_storage_stats function not found, using estimates');
        return handleEstimatedData();

    } catch (error) {
        console.error('DB Stats API error:', error);
        // Try fallback on any error
        return handleEstimatedData();
    }
}

/**
 * Handle accurate data from PostgreSQL functions
 */
async function handleAccurateData(storageData: any[]) {
    try {
        // Get row counts for all tables in parallel
        const tableNames = storageData.map(t => t.table_name);
        const counts: Record<string, number> = {};

        await Promise.all(
            tableNames.map(async (tableName) => {
                try {
                    const { count } = await supabaseAdmin
                        .from(tableName)
                        .select('*', { count: 'exact', head: true });
                    counts[tableName] = Number(count) || 0;
                } catch (err) {
                    counts[tableName] = 0;
                }
            })
        );

        // Format the data
        const tables = storageData.map(row => ({
            table_name: row.table_name,
            row_count: counts[row.table_name] || 0,
            total_size: formatBytes(row.total_size_bytes),
            table_size: formatBytes(row.table_size_bytes),
            indexes_size: formatBytes(row.indexes_size_bytes),
            total_size_bytes: Number(row.total_size_bytes) || 0
        }));

        // Calculate total
        const totalBytes = tables.reduce((sum, t) => sum + t.total_size_bytes, 0);

        return NextResponse.json({
            tables,
            summary: {
                total_size_bytes: totalBytes,
                total_size_pretty: formatBytes(totalBytes),
                total_tables: tables.length,
                data_source: 'accurate' // Indicator that this is real data
            },
            recordCounts: counts
        });

    } catch (error) {
        console.error('Error processing accurate data:', error);
        return handleEstimatedData();
    }
}

/**
 * Fallback: Use estimates based on row counts
 */
async function handleEstimatedData() {
    try {
        // Hardcoded list of tables
        const knownTables = [
            'bookings',
            'booking_guests',
            'customers',
            'pitches',
            'sectors',
            'pricing_seasons',
            'customer_groups',
            'group_pricing_rules',
            'group_bundle_discounts',
            'group_season_configuration',
            'app_logs'
        ];

        // Get row counts
        const counts: Record<string, number> = {};
        await Promise.all(
            knownTables.map(async (tableName) => {
                try {
                    const { count } = await supabaseAdmin
                        .from(tableName)
                        .select('*', { count: 'exact', head: true });
                    counts[tableName] = Number(count) || 0;
                } catch (err) {
                    counts[tableName] = 0;
                }
            })
        );

        // Estimate sizes - ADJUSTED to match reality better
        const rowSizeEstimates: Record<string, number> = {
            'booking_guests': 2000,      // Increased
            'bookings': 1500,             // Increased
            'customers': 1000,            // Increased
            'pitches': 600,
            'sectors': 400,
            'pricing_seasons': 700,
            'customer_groups': 800,
            'group_pricing_rules': 900,
            'group_bundle_discounts': 800,
            'group_season_configuration': 700,
            'app_logs': 600
        };

        const tableStats = knownTables.map((tableName) => {
            const rowCount = counts[tableName] || 0;
            const avgRowSize = rowSizeEstimates[tableName] || 1000;

            const tableBytes = rowCount * avgRowSize;
            const indexBytes = Math.floor(tableBytes * 0.3);
            const totalBytes = tableBytes + indexBytes;

            return {
                table_name: tableName,
                row_count: rowCount,
                total_size: formatBytes(totalBytes),
                table_size: formatBytes(tableBytes),
                indexes_size: formatBytes(indexBytes),
                total_size_bytes: totalBytes
            };
        });

        // Filter and sort
        const nonEmptyTables = tableStats.filter(t => t.row_count > 0);
        nonEmptyTables.sort((a, b) => b.total_size_bytes - a.total_size_bytes);

        const totalBytes = nonEmptyTables.reduce((sum, t) => sum + t.total_size_bytes, 0);

        return NextResponse.json({
            tables: nonEmptyTables,
            summary: {
                total_size_bytes: totalBytes,
                total_size_pretty: formatBytes(totalBytes) + ' (estimated)',
                total_tables: nonEmptyTables.length,
                data_source: 'estimated' // Indicate this is estimated
            },
            recordCounts: counts
        });

    } catch (error) {
        console.error('Fallback error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch database statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
