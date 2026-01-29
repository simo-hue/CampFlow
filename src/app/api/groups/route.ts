
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = supabaseAdmin;

        // Fetch groups
        const { data: groups, error } = await supabase
            .from('customer_groups')
            .select('*')
            .order('name');

        if (error) throw error;

        // Fetch their seasonal configurations
        const { data: configs, error: configError } = await supabase
            .from('group_season_configuration')
            .select('*');

        if (configError) throw configError;

        // Merge configs into groups
        const groupsWithConfigs = groups.map(group => ({
            ...group,
            season_configurations: configs.filter(c => c.group_id === group.id)
        }));

        // Fetch Bundles
        const { data: bundles, error: bundlesError } = await supabase
            .from('group_bundles')
            .select('*');

        if (bundlesError) throw bundlesError;

        // Merge bundles into groups
        const groupsWithAll = groupsWithConfigs.map(group => ({
            ...group,
            bundles: bundles.filter((b: any) => b.group_id === group.id)
        }));

        return NextResponse.json({ groups: groupsWithAll });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let createdGroupId: string | null = null;
    const supabase = supabaseAdmin;

    try {
        const body = await request.json();
        const { name, description, color, season_configurations, bundles } = body;

        // 1. Create Group
        const { data: group, error: groupError } = await supabase
            .from('customer_groups')
            .insert({
                name,
                description,
                color
            })
            .select()
            .single();

        if (groupError) throw groupError;
        createdGroupId = group.id;

        // 2. Create Configurations (if any)
        if (season_configurations && season_configurations.length > 0) {
            const configsToInsert = season_configurations.map((c: any) => ({
                group_id: group.id,
                season_id: c.season_id,
                discount_percentage: c.discount_percentage,
                custom_rates: c.custom_rates
            }));

            const { error: configsError } = await supabase
                .from('group_season_configuration')
                .insert(configsToInsert);

            if (configsError) throw configsError;
        }

        // 3. Create Bundles (if any)
        if (bundles && bundles.length > 0) {
            const bundlesToInsert = bundles.map((b: any) => ({
                group_id: group.id,
                // Ensure season_id is included if present, fallback to specific logic or error if missing?
                // The Type says season_id is optional but for season-specific bundles it is required.
                // Depending on the previous refactor, we must pass it.
                season_id: b.season_id,
                nights: b.nights,
                pitch_price: b.pitch_price,
                unit_prices: b.unit_prices
            }));

            const { error: bundlesError } = await supabase
                .from('group_bundles')
                .insert(bundlesToInsert);

            if (bundlesError) throw bundlesError;
        }

        return NextResponse.json({ group });
    } catch (error: any) {
        console.error('Error creating group:', error);

        // Manual Rollback: Delete the group if it was created but subsequent steps failed
        if (createdGroupId) {
            console.log(`Rolling back creation of group ${createdGroupId}...`);
            await supabase.from('customer_groups').delete().eq('id', createdGroupId);
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
