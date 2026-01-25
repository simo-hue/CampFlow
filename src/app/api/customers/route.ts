
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Search by name, surname, email or phone
    let queryBuilder = supabaseAdmin
        .from('customers')
        .select('*');

    if (query) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,license_plate.ilike.%${query}%`);
    } else {
        queryBuilder = queryBuilder.order('last_name', { ascending: true });
    }

    const { data, error } = await queryBuilder.limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ customers: data });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.first_name || !body.last_name) {
            return NextResponse.json(
                { error: 'First name and last name are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('customers')
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error('Error creating customer:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error creating customer:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
