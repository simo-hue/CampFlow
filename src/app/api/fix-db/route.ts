import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
    try {
        // 1. Get the first sector
        const { data: sectors } = await supabaseAdmin.from('sectors').select('id, name').limit(1);

        if (!sectors || sectors.length === 0) {
            return NextResponse.json({ error: 'No sectors found. Create a sector first.' });
        }

        const defaultSector = sectors[0];
        console.log(`🛠️ Fixing DB: Assigning pitches to sector ${defaultSector.name} (${defaultSector.id})`);

        // 2. Update all pitches that have no sector_id or invalid one
        // For simplicity in this fix, we define filtering logic or just update all for now since user said they moved to new system
        const { data: pitches, error: updateError } = await supabaseAdmin
            .from('pitches')
            .update({ sector_id: defaultSector.id })
            .is('sector_id', null) // Only update those without sector
            .select();

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: `Updated ${pitches.length} pitches to sector ${defaultSector.name}`,
            sector: defaultSector,
            updated_pitches: pitches.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
