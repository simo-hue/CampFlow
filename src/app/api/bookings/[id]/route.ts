import { NextRequest, NextResponse } from 'next/server';
import { logToDb } from '@/lib/logger-server';
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
            await logToDb('error', 'Error fetching booking details:', error);
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
        await logToDb('error', 'Booking GET error:', error);
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

        // 1. Get current booking to find customer_id and current values
        const { data: currentBooking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !currentBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // 2. Handle Customer Updates
        if (body.customer && currentBooking.customer_id) {
            const customerUpdates: any = {};
            if (body.customer.first_name) customerUpdates.first_name = body.customer.first_name;
            if (body.customer.last_name) customerUpdates.last_name = body.customer.last_name;
            if (body.customer.email !== undefined) customerUpdates.email = body.customer.email;
            if (body.customer.phone) customerUpdates.phone = body.customer.phone;
            if (body.customer.address !== undefined) customerUpdates.address = body.customer.address;
            if (body.customer.license_plate !== undefined) customerUpdates.license_plate = body.customer.license_plate;
            if (body.customer.notes !== undefined) customerUpdates.notes = body.customer.notes;

            if (Object.keys(customerUpdates).length > 0) {
                const { error: customerError } = await supabaseAdmin
                    .from('customers')
                    .update(customerUpdates)
                    .eq('id', currentBooking.customer_id);

                if (customerError) {
                    await logToDb('error', 'Error updating customer:', customerError);
                    console.error('Error updating customer:', customerError);
                    // We continue even if customer update fails, but log it
                }
            }
        }

        // 3. Handle Booking Updates
        const updates: any = {};
        if (body.status) updates.status = body.status;
        if (typeof body.questura_sent === 'boolean') updates.questura_sent = body.questura_sent;
        if (body.notes !== undefined) updates.notes = body.notes;
        if (body.pitch_id) updates.pitch_id = body.pitch_id;
        
        // Handle dates/period
        if (body.check_in || body.check_out) {
            const checkIn = body.check_in || currentBooking.booking_period.match(/\[([^,]+),/)?.[1];
            const checkOut = body.check_out || currentBooking.booking_period.match(/,([^\)]+)\)/)?.[1];
            if (checkIn && checkOut) {
                updates.booking_period = `[${checkIn},${checkOut})`;
                
                // If dates or pitch changed, we might want to recalculate price
                // For now, let's keep it simple or use the one from body if provided
                if (body.total_price !== undefined) {
                    updates.total_price = body.total_price;
                }
            }
        } else if (body.total_price !== undefined) {
            updates.total_price = body.total_price;
        }

        if (body.guests_count !== undefined) updates.guests_count = body.guests_count;
        if (body.children_count !== undefined) updates.children_count = body.children_count;
        if (body.dogs_count !== undefined) updates.dogs_count = body.dogs_count;
        if (body.cars_count !== undefined) updates.cars_count = body.cars_count;

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
            .select(`
                *,
                pitch:pitches(*),
                customer:customers(*),
                guests:booking_guests(*)
            `)
            .single();

        if (error) {
            await logToDb('error', 'Error updating booking:', error);
            console.error('Error updating booking:', error);
            
            // Handle overbooking error
            if (error.code === '23P01') {
                return NextResponse.json(
                    { error: 'La piazzola è già occupata in questo periodo' },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to update booking' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        await logToDb('error', 'Booking PATCH error:', error);
        console.error('Booking PATCH error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) {
            await logToDb('error', 'Error deleting booking:', error);
            console.error('Error deleting booking:', error);
            return NextResponse.json(
                { error: 'Failed to delete booking' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        await logToDb('error', 'Booking DELETE error:', error);
        console.error('Booking DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
