import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { format, parseISO, startOfDay, endOfDay, addDays, eachDayOfInterval } from 'date-fns';

/**
 * GET /api/stats/weekly-occupancy
 * 
 * Returns daily occupancy counts for piazzola and tenda within a date range.
 * Used by the WeeklyOccupancyWidget on the dashboard.
 * 
 * Query params:
 * - start: YYYY-MM-DD
 * - end: YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startParam = searchParams.get('start');
        const endParam = searchParams.get('end');

        if (!startParam || !endParam) {
            return NextResponse.json(
                { error: 'start and end date parameters are required' },
                { status: 400 }
            );
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startParam) || !dateRegex.test(endParam)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        const rangeStart = startOfDay(parseISO(startParam));
        const rangeEnd = endOfDay(parseISO(endParam));

        // Construct range string for PostgreSQL DATERANGE overlap query
        const rangeStr = `[${format(rangeStart, 'yyyy-MM-dd')},${format(addDays(rangeEnd, 1), 'yyyy-MM-dd')})`;

        // Fetch overlapping bookings using supabaseAdmin (bypasses RLS)
        const { data: bookingsData, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                booking_period,
                pitch_id,
                pitch:pitches(type)
            `)
            .in('status', ['confirmed', 'checked_in'])
            .overlaps('booking_period', rangeStr);

        if (error) {
            console.error('[weekly-occupancy] Query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch occupancy data' },
                { status: 500 }
            );
        }

        // Process data in memory
        const daysMap = new Map<string, { piazzola: number; tenda: number }>();
        const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

        // Initialize map with all days in range
        days.forEach(day => {
            daysMap.set(format(day, 'yyyy-MM-dd'), { piazzola: 0, tenda: 0 });
        });

        // Helper to parse PostgreSQL daterange format "[YYYY-MM-DD,YYYY-MM-DD)"
        const getDates = (period: string) => {
            const [s, e] = period.replace(/[\[\)]/g, '').split(',');
            return { start: parseISO(s), end: parseISO(e) };
        };

        // Count occupancy per day per pitch type
        bookingsData?.forEach((booking) => {
            const { start: bStart, end: bEnd } = getDates(booking.booking_period);
            // Supabase join returns pitch as array, get first element
            const pitchData = Array.isArray(booking.pitch) ? booking.pitch[0] : booking.pitch;
            const pitchType = pitchData?.type;

            let current = startOfDay(bStart);
            const limit = startOfDay(bEnd);

            while (current < limit) {
                if (current >= rangeStart && current <= rangeEnd) {
                    const dayStr = format(current, 'yyyy-MM-dd');
                    if (daysMap.has(dayStr)) {
                        const entry = daysMap.get(dayStr)!;
                        if (pitchType === 'piazzola') entry.piazzola++;
                        else if (pitchType === 'tenda') entry.tenda++;
                    }
                }
                current = addDays(current, 1);
            }
        });

        // Convert map to array
        const result = Array.from(daysMap.entries()).map(([date, counts]) => ({
            date,
            piazzola: counts.piazzola,
            tenda: counts.tenda,
            total: counts.piazzola + counts.tenda
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error('[weekly-occupancy] API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
