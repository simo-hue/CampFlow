import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. Fetch Customer Details
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (customerError || !customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // 2. Fetch Customer Bookings with related Pitch info
        const { data: bookings, error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                pitch:pitches(name, number, type),
                guests:booking_guests(count)
            `)
            .eq('customer_id', id)
            .order('created_at', { ascending: false });

        if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError);
            // We return the customer even if bookings fail, just with empty bookings
        }

        return NextResponse.json({
            customer,
            bookings: bookings || []
        });

    } catch (error) {
        console.error('Customer GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Allowed fields for update
        // We only allow specific fields to prevent accidental overwrites of critical data like email/name unless intended (though here we might as well allow it if needed)
        // For check-in, we focus on documents and birth info.
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'address', 'notes',
            'birth_date', 'birth_place', 'birth_country', 'birth_city', 'birth_province', 'citizenship', 'gender',
            'residence_country', 'residence_province', 'residence_city', 'residence_zip',
            'document_type', 'document_number', 'document_issue_country', 'document_issue_city', 'document_issue_date', 'document_issuer'
        ];

        const updates: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        updates.updated_at = new Date().toISOString();

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('customers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating customer:', error);
            return NextResponse.json(
                { error: 'Failed to update customer' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Customer PATCH error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
