import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/occupancy/batch
 * 
 * OTTIMIZZATO: Restituisce tutte le occupancy per un settore + date range in UNA SOLA query
 * invece di centinaia di richieste individuali
 * 
 * Query params:
 * - sector_min: (optional) numero minimo piazzola (es. 1) 
 * - sector_max: (optional) numero massimo piazzola (es. 25)
 * - date_from: YYYY-MM-DD (es. 2026-01-18)
 * - date_to: YYYY-MM-DD (es. 2026-01-25)
 * 
 * Note: sector params are optional for tents which don't belong to sectors
 * 
 * Returns: { pitches: [...], bookings: [...] }
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sectorMin = searchParams.get('sector_min');
        const sectorMax = searchParams.get('sector_max');
        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');

        if (!dateFrom || !dateTo) {
            return NextResponse.json(
                { error: 'date_from and date_to are required' },
                { status: 400 }
            );
        }

        // Query 1: Get pitches (with optional sector filtering)
        let pitchQuery = supabaseAdmin
            .from('pitches')
            .select('*')
            .order('number');

        // Apply sector filter only if provided (for piazzole)
        if (sectorMin && sectorMax) {
            const min = parseInt(sectorMin);
            const max = parseInt(sectorMax);
            pitchQuery = pitchQuery
                .gte('number', min.toString().padStart(3, '0'))
                .lte('number', max.toString().padStart(3, '0'));
        }

        const { data: pitches, error: pitchesError } = await pitchQuery;

        if (pitchesError) {
            console.error('Error fetching pitches:', pitchesError);
            return NextResponse.json(
                { error: 'Failed to fetch pitches' },
                { status: 500 }
            );
        }

        // Query 2: Get ALL bookings che si sovrappongono con il date range (1 sola query!)
        const { data: bookings, error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .select(`
                id,
                pitch_id,
                booking_period,
                guests_count,
                status,
                customer:customers(full_name)
            `)
            .overlaps('booking_period', `[${dateFrom},${dateTo})`)
            .neq('status', 'cancelled')
            .in('pitch_id', pitches.map(p => p.id));

        if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError);
            return NextResponse.json(
                { error: 'Failed to fetch bookings' },
                { status: 500 }
            );
        }

        // Format bookings per facilitare il parsing client-side
        const formattedBookings = bookings.map(booking => {
            const periodMatch = booking.booking_period?.match(/\[([^,]+),([^\)]+)\)/);
            const customerData = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;

            return {
                pitch_id: booking.pitch_id,
                check_in: periodMatch ? periodMatch[1] : null,
                check_out: periodMatch ? periodMatch[2] : null,
                booking_period: booking.booking_period,
                customer_name: (customerData as { full_name?: string })?.full_name || 'N/A',
                guests_count: booking.guests_count,
                status: booking.status,
            };
        });

        console.log(`✅ Batch query: ${pitches.length} pitches, ${formattedBookings.length} bookings`);

        return NextResponse.json({
            pitches,
            bookings: formattedBookings,
            stats: {
                pitch_count: pitches.length,
                booking_count: formattedBookings.length,
                date_range: { from: dateFrom, to: dateTo },
            }
        });

    } catch (error) {
        console.error('Batch occupancy API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
