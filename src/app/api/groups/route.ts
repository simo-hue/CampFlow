
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
            .from('group_season_configurations')
            .select('*');

        if (configError) throw configError;

        // Merge configs into groups
        const groupsWithConfigs = groups.map(group => ({
            ...group,
            season_configurations: configs.filter(c => c.group_id === group.id)
        }));

        return NextResponse.json({ groups: groupsWithConfigs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, color, season_configurations } = body;

        const supabase = supabaseAdmin;

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

        // 2. Create Configurations (if any)
        if (season_configurations && season_configurations.length > 0) {
            const configsToInsert = season_configurations.map((c: any) => ({
                group_id: group.id,
                season_id: c.season_id,
                discount_percentage: c.discount_percentage,
                custom_rates: c.custom_rates
            }));

            const { error: configsError } = await supabase
                .from('group_season_configurations')
                .insert(configsToInsert);

            if (configsError) throw configsError;
        }

        return NextResponse.json({ group });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
