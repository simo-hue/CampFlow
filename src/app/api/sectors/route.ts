import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('sectors')
            .select('*')
            .order('name');

        if (error) throw error;

        return NextResponse.json({ sectors: data });
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('sectors')
            .insert({ name })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ sector: data }, { status: 201 });
    } catch (error) {
        console.error('Error creating sector:', error);
        return NextResponse.json({ error: 'Failed to create sector' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const { name } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { data, error } = await supabaseAdmin
            .from('sectors')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ sector: data });
    } catch (error) {
        console.error('Error updating sector:', error);
        return NextResponse.json({ error: 'Failed to update sector' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Check for usage in pitches (assuming sector_id is used now, or we might need to check logic)
        // Since we JUST added sector_id support, let's check it.
        // We need to support backward compatibility where old code didn't use sector_id yet fully,
        // but for safety, preventing deletion if used is good.
        // Note: the `sector_id` column on pitches might be null for old pitches, so this check only catches explicitly assigned ones.

        /*
        // For now, let's assume if we are deleting, we just check pitches table
        const { count, error: countError } = await supabaseAdmin
            .from('pitches')
            .select('*', { count: 'exact', head: true })
            .eq('sector_id', id);

        if (countError) throw countError;
        if (count && count > 0) {
             return NextResponse.json({ error: 'Cannot delete sector used by pitches' }, { status: 409 });
        }
        */
        // Logic commented out until we are sure migration for sector_id is applied and populated if we want strict integrity which we probably do.
        // For now, let's allow it but maybe add a warning in UI.

        const { error } = await supabaseAdmin
            .from('sectors')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting sector:', error);
        return NextResponse.json({ error: 'Failed to delete sector' }, { status: 500 });
    }
}
