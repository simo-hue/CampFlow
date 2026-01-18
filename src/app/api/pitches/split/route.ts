import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/pitches/split
 * Splits a single pitch into two (a and b)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pitch_id } = body;

        if (!pitch_id) {
            return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
        }

        // Get the pitch to split
        const { data: pitch, error: fetchError } = await supabaseAdmin
            .from('pitches')
            .select('*')
            .eq('id', pitch_id)
            .single();

        if (fetchError || !pitch) {
            return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
        }

        // Validate: pitch must have empty suffix (single pitch)
        if (pitch.suffix !== '') {
            return NextResponse.json(
                { error: 'Can only split single pitches (no suffix)' },
                { status: 400 }
            );
        }

        // Check for active bookings
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('pitch_id', pitch_id)
            .gte('booking_period', `[${new Date().toISOString().split('T')[0]},`)
            .in('status', ['confirmed', 'checked_in']);

        if (bookings && bookings.length > 0) {
            return NextResponse.json(
                { error: 'Cannot split pitch with active or future bookings' },
                { status: 409 }
            );
        }

        // Check if split pitches would conflict
        const { data: conflicts } = await supabaseAdmin
            .from('pitches')
            .select('id')
            .eq('number', pitch.number)
            .in('suffix', ['a', 'b']);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json(
                { error: `Pitch ${pitch.number}a or ${pitch.number}b already exists` },
                { status: 409 }
            );
        }

        // Perform split: Update existing to 'a', create new 'b'
        const { error: updateError } = await supabaseAdmin
            .from('pitches')
            .update({ suffix: 'a' })
            .eq('id', pitch_id);

        if (updateError) {
            console.error('Error updating pitch to suffix a:', updateError);
            return NextResponse.json({ error: 'Failed to split pitch' }, { status: 500 });
        }

        const { data: newPitch, error: createError } = await supabaseAdmin
            .from('pitches')
            .insert({
                number: pitch.number,
                suffix: 'b',
                type: pitch.type,
                attributes: pitch.attributes,
                status: 'available',
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating pitch b:', createError);
            // Rollback: revert suffix to empty
            await supabaseAdmin
                .from('pitches')
                .update({ suffix: '' })
                .eq('id', pitch_id);

            return NextResponse.json({ error: 'Failed to create split pitch' }, { status: 500 });
        }

        // Fetch updated original pitch
        const { data: updatedPitch } = await supabaseAdmin
            .from('pitches')
            .select('*')
            .eq('id', pitch_id)
            .single();

        return NextResponse.json({
            success: true,
            pitches: [updatedPitch, newPitch],
        });
    } catch (error) {
        console.error('Split pitch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
