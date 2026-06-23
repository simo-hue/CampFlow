
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

// Columns a client is allowed to set when creating a customer.
// (Allow-listing avoids mass-assignment and "unknown column" insert errors.)
const CUSTOMER_INSERT_COLUMNS = [
    'first_name', 'last_name', 'email', 'phone', 'address', 'notes', 'personal_id_code',
    'birth_date', 'birth_country', 'birth_city', 'birth_province', 'citizenship', 'gender', 'license_plate',
    'residence_country', 'residence_province', 'residence_city', 'residence_zip',
    'document_type', 'document_number', 'document_issue_country', 'document_issue_city', 'document_issue_date', 'document_issuer',
] as const;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = supabaseAdmin;

        const payload: Record<string, unknown> = {};
        for (const col of CUSTOMER_INSERT_COLUMNS) {
            const value = body[col];
            // Skip undefined/empty so optional fields fall back to NULL/defaults.
            if (value !== undefined && value !== '') payload[col] = value;
        }
        // Normalize the group reference ('none'/''/undefined -> null).
        payload.group_id = (body.group_id === 'none' || body.group_id === '' || body.group_id == null)
            ? null
            : body.group_id;

        if (!payload.first_name || !payload.last_name || !payload.phone) {
            return NextResponse.json(
                { error: 'Nome, cognome e telefono sono obbligatori' },
                { status: 400 }
            );
        }

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
