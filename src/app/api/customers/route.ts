
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = supabaseAdmin;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('search');

    let queryBuilder = supabase
        .from('customers')
        .select('*, customer_groups ( name, color )');

    if (query) {
        // Sanitize before embedding into a PostgREST `.or()` filter string.
        // Commas / parentheses / quotes / backslashes are structural in PostgREST
        // and would let a crafted `q` break out and alter the OR filter (injection).
        const safe = query.replace(/[,()"\\]/g, ' ').trim();
        if (safe) {
            queryBuilder = queryBuilder.or(
                `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,license_plate.ilike.%${safe}%`
            );
        }
    }

    const groupId = searchParams.get('group_id');
    if (groupId && groupId !== 'all') {
        if (groupId === 'none') {
            queryBuilder = queryBuilder.is('group_id', null);
        } else {
            queryBuilder = queryBuilder.eq('group_id', groupId);
        }
    }

    // Sort by most recent
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    const { data: customers, error } = await queryBuilder;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customers });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { group_id, ...customerData } = body;
        const supabase = supabaseAdmin;

        const payload = {
            ...customerData,
            group_id: group_id === 'none' ? null : group_id
        };

        const { data, error } = await supabase
            .from('customers')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
