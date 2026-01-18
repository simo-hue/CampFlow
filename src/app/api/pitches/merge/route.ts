import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/pitches/merge
 * Merges two pitches (a and b) into a single pitch
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pitch_a_id, pitch_b_id } = body;

        if (!pitch_a_id || !pitch_b_id) {
            return NextResponse.json({ error: 'Both pitch IDs required' }, { status: 400 });
        }

        // Fetch both pitches
        const { data: pitches, error: fetchError } = await supabaseAdmin
            .from('pitches')
            .select('*')
            .in('id', [pitch_a_id, pitch_b_id]);

        if (fetchError || !pitches || pitches.length !== 2) {
            return NextResponse.json({ error: 'One or both pitches not found' }, { status: 404 });
        }

        const [pitchA, pitchB] = pitches;

        // Validate: same number, complementary suffixes
        if (pitchA.number !== pitchB.number) {
            return NextResponse.json(
                { error: 'Pitches must have the same number' },
                { status: 400 }
            );
        }

        const suffixes = [pitchA.suffix, pitchB.suffix].sort();
        if (suffixes[0] !== 'a' || suffixes[1] !== 'b') {
            return NextResponse.json(
                { error: 'Pitches must have suffixes "a" and "b"' },
                { status: 400 }
            );
        }

        // Check for active bookings on both pitches
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('id, pitch_id')
            .in('pitch_id', [pitch_a_id, pitch_b_id])
            .gte('booking_period', `[${new Date().toISOString().split('T')[0]},`)
            .in('status', ['confirmed', 'checked_in']);

        if (bookings && bookings.length > 0) {
            return NextResponse.json(
                { error: 'Cannot merge pitches with active or future bookings' },
                { status: 409 }
            );
        }

        // Check if merged pitch (no suffix) already exists
        const { data: conflicts } = await supabaseAdmin
            .from('pitches')
            .select('id')
            .eq('number', pitchA.number)
            .eq('suffix', '');

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json(
                { error: `Single pitch ${pitchA.number} already exists` },
                { status: 409 }
            );
        }

        // Determine which pitch to keep (prefer 'a')
        const keepPitch = pitchA.suffix === 'a' ? pitchA : pitchB;
        const deletePitch = pitchA.suffix === 'a' ? pitchB : pitchA;

        // Perform merge: Update kept pitch to no suffix, delete other
        const { error: updateError } = await supabaseAdmin
            .from('pitches')
            .update({ suffix: '' })
            .eq('id', keepPitch.id);

        if (updateError) {
            console.error('Error updating pitch suffix:', updateError);
            return NextResponse.json({ error: 'Failed to merge pitches' }, { status: 500 });
        }

        const { error: deleteError } = await supabaseAdmin
            .from('pitches')
            .delete()
            .eq('id', deletePitch.id);

        if (deleteError) {
            console.error('Error deleting pitch:', deleteError);
            // Rollback: restore suffix
            await supabaseAdmin
                .from('pitches')
                .update({ suffix: keepPitch.suffix })
                .eq('id', keepPitch.id);

            return NextResponse.json({ error: 'Failed to delete pitch during merge' }, { status: 500 });
        }

        // Fetch merged pitch
        const { data: mergedPitch } = await supabaseAdmin
            .from('pitches')
            .select('*')
            .eq('id', keepPitch.id)
            .single();

        return NextResponse.json({
            success: true,
            pitch: mergedPitch,
        });
    } catch (error) {
        console.error('Merge pitch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
