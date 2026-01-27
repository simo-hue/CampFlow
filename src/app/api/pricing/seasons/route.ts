import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { PricingSeason } from '@/lib/types';

/**
 * GET /api/pricing/seasons
 * Retrieve all pricing seasons (active and inactive)
 */
export async function GET(request: Request) {
    try {
        const supabase = supabaseAdmin;
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        let query = supabase
            .from('pricing_seasons')
            .select('*')
            .order('start_date', { ascending: true })
            .order('priority', { ascending: false });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching pricing seasons:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pricing seasons' },
                { status: 500 }
            );
        }

        return NextResponse.json({ seasons: data || [] });
    } catch (error) {
        console.error('Unexpected error in GET /api/pricing/seasons:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/pricing/seasons
 * Create a new pricing season
 */
export async function POST(request: Request) {
    try {
        const supabase = supabaseAdmin;
        const body = await request.json();

        // Validation
        const { name, start_date, end_date, piazzola_price_per_day, tenda_price_per_day, person_price_per_day, child_price_per_day, dog_price_per_day, car_price_per_day, priority, color, description } = body;

        if (!name || !start_date || !end_date) {
            return NextResponse.json(
                { error: 'Missing required fields: name, start_date, end_date' },
                { status: 400 }
            );
        }

        if (piazzola_price_per_day === undefined || tenda_price_per_day === undefined ||
            person_price_per_day === undefined || child_price_per_day === undefined ||
            dog_price_per_day === undefined || car_price_per_day === undefined) {
            return NextResponse.json(
                { error: 'Missing required price fields' },
                { status: 400 }
            );
        }

        // Validate date range
        if (new Date(start_date) > new Date(end_date)) {
            return NextResponse.json(
                { error: 'Start date must be before or equal to end date' },
                { status: 400 }
            );
        }

        // Validate prices
        if (piazzola_price_per_day < 0 || tenda_price_per_day < 0 ||
            person_price_per_day < 0 || child_price_per_day < 0 ||
            dog_price_per_day < 0 || car_price_per_day < 0) {
            return NextResponse.json(
                { error: 'Prices must be positive' },
                { status: 400 }
            );
        }

        const newSeason: Partial<PricingSeason> = {
            name,
            description: description || null,
            start_date,
            end_date,
            piazzola_price_per_day: parseFloat(piazzola_price_per_day),
            tenda_price_per_day: parseFloat(tenda_price_per_day),
            person_price_per_day: parseFloat(person_price_per_day),
            child_price_per_day: parseFloat(child_price_per_day),
            dog_price_per_day: parseFloat(dog_price_per_day),
            car_price_per_day: parseFloat(car_price_per_day),
            priority: priority !== undefined ? parseInt(priority) : 0,
            color: color || '#3b82f6',
            is_active: true,
        };

        const { data, error } = await supabase
            .from('pricing_seasons')
            .insert([newSeason])
            .select()
            .single();

        if (error) {
            console.error('Error creating pricing season:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to create pricing season' },
                { status: 500 }
            );
        }

        return NextResponse.json({ season: data }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error in POST /api/pricing/seasons:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/pricing/seasons?id=xxx
 * Update an existing pricing season
 */
export async function PUT(request: Request) {
    try {
        const supabase = supabaseAdmin;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing season ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        // Validation
        const { name, start_date, end_date, piazzola_price_per_day, tenda_price_per_day, person_price_per_day, child_price_per_day, dog_price_per_day, car_price_per_day, priority, color, description } = body;

        // Build update object (only include provided fields)
        const updates: Partial<PricingSeason> = {};

        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;
        if (piazzola_price_per_day !== undefined) updates.piazzola_price_per_day = parseFloat(piazzola_price_per_day);
        if (tenda_price_per_day !== undefined) updates.tenda_price_per_day = parseFloat(tenda_price_per_day);
        if (person_price_per_day !== undefined) updates.person_price_per_day = parseFloat(person_price_per_day);
        if (child_price_per_day !== undefined) updates.child_price_per_day = parseFloat(child_price_per_day);
        if (dog_price_per_day !== undefined) updates.dog_price_per_day = parseFloat(dog_price_per_day);
        if (car_price_per_day !== undefined) updates.car_price_per_day = parseFloat(car_price_per_day);
        if (priority !== undefined) updates.priority = parseInt(priority);
        if (color !== undefined) updates.color = color;
        if (is_active !== undefined) updates.is_active = is_active;

        // Validate if date fields are provided
        if (updates.start_date && updates.end_date) {
            if (new Date(updates.start_date) > new Date(updates.end_date)) {
                return NextResponse.json(
                    { error: 'Start date must be before or equal to end date' },
                    { status: 400 }
                );
            }
        }

        const { data, error } = await supabase
            .from('pricing_seasons')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating pricing season:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to update pricing season' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Season not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ season: data });
    } catch (error) {
        console.error('Unexpected error in PUT /api/pricing/seasons:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/pricing/seasons?id=xxx
 * Soft delete (deactivate) a pricing season
 */
export async function DELETE(request: Request) {
    try {
        const supabase = supabaseAdmin;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing season ID' },
                { status: 400 }
            );
        }

        // Hard delete
        const { data, error } = await supabase
            .from('pricing_seasons')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error deleting pricing season:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to delete pricing season' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Season not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Season deactivated successfully', season: data });
    } catch (error) {
        console.error('Unexpected error in DELETE /api/pricing/seasons:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
