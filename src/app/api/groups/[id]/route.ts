
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        console.log(`[API] Attempting to delete group with ID: ${id}`);

        const supabase = supabaseAdmin;
        const { error, count } = await supabase
            .from('customer_groups')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) {
            console.error('[API] Delete error:', error);
            throw error;
        }

        console.log(`[API] Deleted ${count} rows for group ${id}`);

        if (count === 0) {
            console.warn(`[API] Warning: Delete returned 0 rows for ${id}. Group might not exist or ID mismatch.`);
        }

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error('[API] Delete exception:', error);
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
        const { name, description, color, season_configurations, bundles } = body;
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
            .from('group_season_configuration')
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
                .from('group_season_configuration')
                .insert(configsToInsert);

            if (insertError) throw insertError;
        }

        // 3. Update Bundles
        // Clear existing bundles for this group
        const { error: deleteBundlesError } = await supabase
            .from('group_bundles')
            .delete()
            .eq('group_id', id);

        if (deleteBundlesError) throw deleteBundlesError;

        if (bundles && bundles.length > 0) {
            const bundlesToInsert = bundles.map((b: any) => ({
                group_id: id,
                season_id: b.season_id,
                nights: b.nights,
                pitch_price: b.pitch_price,
                unit_prices: b.unit_prices
            }));

            const { error: insertBundlesError } = await supabase
                .from('group_bundles')
                .insert(bundlesToInsert);

            if (insertBundlesError) throw insertBundlesError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
