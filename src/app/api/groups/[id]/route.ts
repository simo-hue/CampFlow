
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
    try {
        const { id } = await params;
        const supabase = supabaseAdmin;
        const { error } = await supabase
            .from('customer_groups')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, color, season_configurations } = body;
        const supabase = supabaseAdmin;

        // 1. Update Group details
        const { error: groupError } = await supabase
            .from('customer_groups')
            .update({ name, description, color })
            .eq('id', id);

        if (groupError) throw groupError;

        // 2. Update Configurations
        // Strategy: Delete all existing for this group and re-insert. 
        // Simple and effective for this scale.

        const { error: deleteError } = await supabase
            .from('group_season_configurations')
            .delete()
            .eq('group_id', id);

        if (deleteError) throw deleteError;

        if (season_configurations && season_configurations.length > 0) {
            const configsToInsert = season_configurations.map((c: any) => ({
                group_id: id,
                season_id: c.season_id,
                discount_percentage: c.discount_percentage,
                custom_rates: c.custom_rates
            }));

            const { error: insertError } = await supabase
                .from('group_season_configurations')
                .insert(configsToInsert);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
