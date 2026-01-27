
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
    try {
        const { id } = await params;
        const supabase = supabaseAdmin;
        const body = await request.json();

        // Separate potential relational fields that can't be updated directly on 'customers'
        const { group, ...updateData } = body;

        // If group_id is being updated, it will be in updateData (customerDialog handles this)

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
    try {
        const { id } = await params;
        const supabase = supabaseAdmin;

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
