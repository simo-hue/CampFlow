import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/pitches/sector
 * 
 * Returns all pitches in a sector (defined by number range)
 * 
 * Query params:
 * - min: minimum pitch number
 * - max: maximum pitch number
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const min = searchParams.get('min');
        const max = searchParams.get('max');

        if (!min || !max) {
            return NextResponse.json(
                { error: 'min and max parameters are required' },
                { status: 400 }
            );
        }

        const minNum = parseInt(min);
        const maxNum = parseInt(max);

        if (isNaN(minNum) || isNaN(maxNum) || minNum > maxNum) {
            return NextResponse.json(
                { error: 'Invalid min/max range' },
                { status: 400 }
            );
        }

        // Generate pitch numbers with leading zeros (001, 002, ...)
        const pitchNumbers = [];
        for (let i = minNum; i <= maxNum; i++) {
            pitchNumbers.push(i.toString().padStart(3, '0'));
        }

        // Fetch pitches
        const { data: pitches, error } = await supabaseAdmin
            .from('pitches')
            .select('*')
            .in('number', pitchNumbers)
            .order('number')
            .order('suffix');

        if (error) {
            console.error('Error fetching sector pitches:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pitches' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sector_range: { min: minNum, max: maxNum },
            total_pitches: pitches?.length || 0,
            pitches: pitches || [],
        });

    } catch (error) {
        console.error('Sector pitches API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
