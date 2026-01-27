
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = supabaseAdmin;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let queryBuilder = supabase
        .from('customers')
        .select('*, customer_groups ( name, color )');

    if (query) {
        queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const groupId = searchParams.get('group_id');
    if (groupId && groupId !== 'all') {
        if (groupId === 'none') {
            queryBuilder.is('group_id', null);
        } else {
            queryBuilder.eq('group_id', groupId);
        }
    }

    // Sort by most recent
    queryBuilder.order('created_at', { ascending: false });

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
