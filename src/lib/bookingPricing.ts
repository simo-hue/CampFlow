/**
 * Server-side booking price calculation.
 *
 * Shared by POST /api/bookings (create) and PATCH /api/bookings/[id] (edit) so
 * both compute automatic prices identically. Server-only: it reads pricing data
 * with the service-role client.
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { calculatePrice } from '@/lib/pricing';
import type { GroupBundle, GroupSeasonConfiguration, PitchType } from '@/lib/types';

export interface BookingPriceInput {
    checkIn: string;        // YYYY-MM-DD
    checkOut: string;       // YYYY-MM-DD
    pitchType: PitchType;
    guestsCount: number;    // TOTAL guests (adults + children)
    childrenCount?: number;
    dogsCount?: number;
    carsCount?: number;
    groupId: string | null; // customer's group, or null
}

/**
 * Computes the automatic total price for a booking. Note `guestsCount` is the
 * TOTAL head count; children are subtracted to derive the adult count, matching
 * the create flow's semantics.
 */
export async function calculateBookingPrice(input: BookingPriceInput): Promise<number> {
    const { data: seasons, error: seasonsError } = await supabaseAdmin
        .from('pricing_seasons')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

    if (seasonsError) {
        throw seasonsError;
    }

    let groupConfigs: GroupSeasonConfiguration[] = [];
    let groupBundles: GroupBundle[] = [];

    if (input.groupId) {
        const { data: configs, error: configError } = await supabaseAdmin
            .from('group_season_configuration')
            .select('*')
            .eq('group_id', input.groupId);
        if (configError) throw configError;
        groupConfigs = configs || [];

        const { data: bundles, error: bundlesError } = await supabaseAdmin
            .from('group_bundles')
            .select('*')
            .eq('group_id', input.groupId);
        if (bundlesError) throw bundlesError;
        groupBundles = bundles || [];
    }

    const children = input.childrenCount || 0;

    return calculatePrice(input.checkIn, input.checkOut, input.pitchType, {
        seasons: seasons || [],
        guests: input.guestsCount - children,
        children,
        dogs: input.dogsCount || 0,
        cars: input.carsCount || 0,
        groupConfigs: groupConfigs.length > 0 ? groupConfigs : undefined,
        bundles: groupBundles.length > 0 ? groupBundles : undefined,
    });
}
