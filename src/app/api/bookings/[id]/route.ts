import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                pitch:pitches(*),
                customer:customers(*),
                guests:booking_guests(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching booking details:', error);
            return NextResponse.json(
                { error: 'Failed to fetch booking details' },
                { status: 500 }
            );
        }

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(booking);

    } catch (error) {
        console.error('Booking GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Filter allowed fields
        const updates: any = {};
        if (body.status) updates.status = body.status;
        if (typeof body.questura_sent === 'boolean') updates.questura_sent = body.questura_sent;
        if (body.notes) updates.notes = body.notes;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating booking:', error);
            return NextResponse.json(
                { error: 'Failed to update booking' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Booking PATCH error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
