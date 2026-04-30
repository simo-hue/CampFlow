import { NextResponse } from 'next/server';
import { logToDb } from '@/lib/logger-server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getTodayItaly } from '@/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        
        let startTarget = dateParam || startDateParam || getTodayItaly();
        let endTarget = dateParam || endDateParam || startTarget;

        // Get arrivals (bookings starting within range)
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                pitch:pitches(number, suffix, type),
                customer:customers(*),
                guests:booking_guests(*)
            `)
            .in('status', ['confirmed', 'checked_in'])
            .order('created_at', { ascending: false });

        if (error) {
            await logToDb('error', 'Error fetching arrivals:', error);
            console.error('Error fetching arrivals:', error);
            return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 });
        }

        // Filter arrivals: start date falls within [startTarget, endTarget]
        const arrivals = bookings?.filter(booking => {
            const match = booking.booking_period?.match(/\[([^,]+),/);
            if (!match) return false;
            const arrivalDate = match[1];
            return arrivalDate >= startTarget && arrivalDate <= endTarget;
        }) || [];

        // Sort by pitch number
        arrivals.sort((a, b) => {
            const pA = a.pitch?.number || '';
            const pB = b.pitch?.number || '';
            return pA.localeCompare(pB, undefined, { numeric: true, sensitivity: 'base' });
        });

        return NextResponse.json({ date: startTarget, endDate: endTarget, arrivals });

    } catch (error) {
        await logToDb('error', 'Arrivals print API error:', error);
        console.error('Arrivals print API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
