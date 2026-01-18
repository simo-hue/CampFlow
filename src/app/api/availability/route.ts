import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/availability
 * 
 * Query available pitches for a given date range and optional type filter
 * 
 * Query params:
 * - check_in: YYYY-MM-DD (required)
 * - check_out: YYYY-MM-DD (required)
 * - pitch_type: standard | comfort | premium (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');
        const pitchType = searchParams.get('pitch_type');

        // Validation
        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'check_in and check_out parameters are required' },
                { status: 400 }
            );
        }

        // Validate date format (basic check)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        // Validate check_out > check_in
        if (new Date(checkIn) >= new Date(checkOut)) {
            return NextResponse.json(
                { error: 'check_out must be after check_in' },
                { status: 400 }
            );
        }

        // Build the query
        let query = supabaseAdmin
            .from('pitches')
            .select('*')
            .eq('status', 'available');

        // Add pitch type filter if provided
        if (pitchType) {
            if (!['standard', 'comfort', 'premium'].includes(pitchType)) {
                return NextResponse.json(
                    { error: 'Invalid pitch_type. Must be: standard, comfort, or premium' },
                    { status: 400 }
                );
            }
            query = query.eq('type', pitchType);
        }

        const { data: allPitches, error: pitchesError } = await query;

        if (pitchesError) {
            console.error('Error fetching pitches:', pitchesError);
            return NextResponse.json(
                { error: 'Failed to fetch pitches' },
                { status: 500 }
            );
        }

        // Query per piazzole disponibili
        // Usa overlap operator (&& ) con daterange
        const { data: occupiedPitches, error: occupiedError } = await supabaseAdmin
            .from('bookings')
            .select('pitch_id')
            .neq('status', 'cancelled')
            .overlaps('booking_period', `[${checkIn},${checkOut})`);

        if (occupiedError) {
            console.error('Error checking occupied pitches:', occupiedError);
            return NextResponse.json(
                { error: 'Failed to check availability' },
                { status: 500 }
            );
        }

        // Get set of occupied pitch IDs
        const occupiedPitchIds = new Set(
            occupiedPitches?.map(booking => booking.pitch_id) || []
        );

        // Filter out occupied pitches
        const availablePitches = allPitches?.filter(
            pitch => !occupiedPitchIds.has(pitch.id)
        ) || [];

        return NextResponse.json({
            check_in: checkIn,
            check_out: checkOut,
            pitch_type: pitchType || 'all',
            total_available: availablePitches.length,
            pitches: availablePitches.sort((a, b) => a.number.localeCompare(b.number)),
        });

    } catch (error) {
        console.error('Availability API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
