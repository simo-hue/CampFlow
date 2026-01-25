import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: bookingId } = await params;

    try {
        const body = await request.json();
        const { guests } = body; // Expects array of guests

        if (!Array.isArray(guests) || guests.length === 0) {
            return NextResponse.json(
                { error: 'Invalid guests data' },
                { status: 400 }
            );
        }

        // 1. Delete existing guests for this booking (full replace strategy)
        // This is simplest for now. Alternatively, we could upsert if we tracked IDs.
        // Given the use case, replacing the list at check-in is acceptable.
        const { error: deleteError } = await supabaseAdmin
            .from('booking_guests')
            .delete()
            .eq('booking_id', bookingId);

        if (deleteError) {
            console.error('Error deleting old guests:', deleteError);
            throw new Error('Failed to clear old guests');
        }

        // 2. Prepare new payload
        const guestsToInsert = guests.map((g: any) => ({
            booking_id: bookingId,
            first_name: g.first_name,
            last_name: g.last_name,
            birth_date: g.birth_date || null,
            birth_country: g.birth_country || null,
            birth_province: g.birth_province || null,
            birth_city: g.birth_city || null,
            gender: g.gender || null,
            citizenship: g.citizenship || null,
            is_head_of_family: g.is_head_of_family || false,
            // Legacy/Computed
            full_name: `${g.first_name} ${g.last_name}`.trim(),
            guest_type: g.guest_type || 'adult'
        }));

        // 3. Insert new guests
        const { data, error: insertError } = await supabaseAdmin
            .from('booking_guests')
            .insert(guestsToInsert)
            .select();

        if (insertError) {
            console.error('Error inserting guests:', insertError);
            throw new Error('Failed to insert guests');
        }

        return NextResponse.json({ success: true, guests: data });

    } catch (error) {
        console.error('Guests update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
