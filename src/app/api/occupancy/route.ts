import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/occupancy
 * 
 * Checks if a specific pitch is occupied during a date range
 * 
 * Query params:
 * - pitch_id: UUID of the pitch
 * - check_in: YYYY-MM-DD
 * - check_out: YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pitchId = searchParams.get('pitch_id');
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');

        if (!pitchId || !checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'pitch_id, check_in, and check_out are required' },
                { status: 400 }
            );
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        // Query for any overlapping bookings using daterange
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
        id,
        booking_period,
        status,
        guests_count,
        customer:customers(first_name, last_name)
      `)
            .eq('pitch_id', pitchId)
            .neq('status', 'cancelled')
            .overlaps('booking_period', `[${checkIn},${checkOut})`);

        if (error) {
            console.error('Error checking occupancy:', error);
            return NextResponse.json(
                { error: 'Failed to check occupancy' },
                { status: 500 }
            );
        }

        const isOccupied = (bookings?.length || 0) > 0;
        let bookingInfo = null;

        if (isOccupied && bookings && bookings.length > 0) {
            const booking = bookings[0];
            // Extract dates from daterange format "[2026-01-01,2026-01-05)"
            const periodMatch = booking.booking_period.match(/\[([^,]+),([^\)]+)\)/);

            // Handle customer data - Supabase returns it as an object or array
            const customerData = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;

            bookingInfo = {
                customer_name: `${(customerData as {first_name?: string, last_name?: string})?.first_name || ''} ${(customerData as {first_name?: string, last_name?: string})?.last_name || ''}`.trim() || 'N/A',
                check_in: periodMatch ? periodMatch[1] : 'N/A',
                check_out: periodMatch ? periodMatch[2] : 'N/A',
                guests_count: booking.guests_count,
            };
        }

        return NextResponse.json({
            pitch_id: pitchId,
            date_range: { check_in: checkIn, check_out: checkOut },
            is_occupied: isOccupied,
            booking: bookingInfo,
        });

    } catch (error) {
        console.error('Occupancy API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
