import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { CreatePitchRequest, UpdatePitchRequest } from '@/lib/types';

/**
 * GET /api/pitches
 * Returns all pitches with optional filters
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const number = searchParams.get('number');

        let query = supabaseAdmin
            .from('pitches')
            .select('*')
            .order('number', { ascending: true })
            .order('suffix', { ascending: true });

        if (type) query = query.eq('type', type);
        if (status) query = query.eq('status', status);
        if (number) query = query.eq('number', number);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching pitches:', error);
            return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 });
        }

        return NextResponse.json({ pitches: data || [] });
    } catch (error) {
        console.error('Pitches API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/pitches
 * Creates a new pitch (single or double)
 */
export async function POST(request: Request) {
    try {
        const body: CreatePitchRequest = await request.json();

        const { number, suffix = '', type, attributes = {}, create_double = false, sector_id } = body;

        if (!number || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate number is integer (digits only)
        if (!/^\d+$/.test(number)) {
            return NextResponse.json(
                { error: 'Il numero della piazzola deve essere un numero intero' },
                { status: 400 }
            );
        }

        // Check availability logic
        if (create_double) {
            // Check if 10a or 10b already exist
            const { data: existing } = await supabaseAdmin
                .from('pitches')
                .select('number, suffix')
                .eq('number', number)
                .in('suffix', ['a', 'b']);

            if (existing && existing.length > 0) {
                return NextResponse.json(
                    { error: `Le piazzole ${number}a/${number}b esistono già` },
                    { status: 409 }
                );
            }
        } else {
            // Check if pitch already exists (exact number + suffix match)
            const { data: existing } = await supabaseAdmin
                .from('pitches')
                .select('id')
                .eq('number', number)
                .eq('suffix', suffix);

            if (existing && existing.length > 0) {
                const fullNumber = suffix ? `${number}${suffix}` : number;
                return NextResponse.json(
                    { error: `La piazzola ${fullNumber} esiste già` },
                    { status: 409 }
                );
            }
        }

        if (create_double) {
            // Create both 'a' and 'b' variants
            const { data, error } = await supabaseAdmin
                .from('pitches')
                .insert([
                    { number, suffix: 'a', type, attributes, status: 'available', sector_id },
                    { number, suffix: 'b', type, attributes, status: 'available', sector_id },
                ])
                .select();

            if (error) {
                console.error('Error creating double pitch:', error);
                return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 });
            }

            return NextResponse.json({ pitches: data }, { status: 201 });
        } else {
            // Create single pitch
            const { data, error } = await supabaseAdmin
                .from('pitches')
                .insert({ number, suffix, type, attributes, status: 'available', sector_id })
                .select()
                .single();

            if (error) {
                console.error('Error creating pitch:', error);
                return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 });
            }

            return NextResponse.json({ pitch: data }, { status: 201 });
        }
    } catch (error) {
        console.error('Pitches POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/pitches
 * Updates an existing pitch
 */
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pitchId = searchParams.get('id');

        if (!pitchId) {
            return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
        }

        const body: UpdatePitchRequest = await request.json();

        // Extract allowed fields including sector_id
        const updateData: any = { ...body };
        // We generally shouldn't allow updating 'number' or 'suffix' easily as it breaks references, 
        // but 'sector_id' is fine.

        const { data, error } = await supabaseAdmin
            .from('pitches')
            .update(updateData)
            .eq('id', pitchId)
            .select()
            .single();

        if (error) {
            console.error('Error updating pitch:', error);
            return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 });
        }

        return NextResponse.json({ pitch: data });
    } catch (error) {
        console.error('Pitches PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/pitches
 * Deletes a pitch (only if no active bookings)
 */
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pitchId = searchParams.get('id');

        if (!pitchId) {
            return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
        }

        // Check for active bookings
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('pitch_id', pitchId)
            .in('status', ['confirmed', 'checked_in']);

        if (bookings && bookings.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete pitch with active bookings' },
                { status: 409 }
            );
        }

        const { error } = await supabaseAdmin
            .from('pitches')
            .delete()
            .eq('id', pitchId);

        if (error) {
            console.error('Error deleting pitch:', error);
            return NextResponse.json({ error: 'Failed to delete pitch' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Pitches DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
