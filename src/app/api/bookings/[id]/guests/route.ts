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
            // Residenza (only for Head of Family, but stored for all if provided)
            address: g.address || null,
            residence_country: g.residence_country || null,
            residence_province: g.residence_province || null,
            residence_city: g.residence_city || null,
            residence_zip: g.residence_zip || null,
            // Documento
            document_type: g.document_type || null,
            document_number: g.document_number || null,
            document_issue_date: g.document_issue_date || null,
            document_issuer: g.document_issuer || null,
            document_issue_city: g.document_issue_city || null,
            document_issue_country: g.document_issue_country || null,
            // Veicolo
            license_plate: g.license_plate || null,
            // Legacy/Computed
            full_name: `${g.last_name} ${g.first_name}`.trim(),
            guest_type: g.guest_type || 'adult'
        }));

        // 3. Insert new guests
        const { data, error: insertError } = await supabaseAdmin
            .from('booking_guests')
            .insert(guestsToInsert)
            .select();

        if (insertError) {
            console.error('Error inserting guests — Supabase error:', JSON.stringify(insertError, null, 2));
            return NextResponse.json(
                { error: 'Failed to insert guests', detail: insertError.message, hint: insertError.hint },
                { status: 500 }
            );
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
