import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logToDb } from '@/lib/logger-server';

/**
 * POST /api/customers/upsert-guest
 *
 * Creates or updates a customer record from a booking guest (secondary guest, non-head-of-family).
 * Match strategy: first_name + last_name + birth_date (strict match).
 * Phone is optional for secondary guests; defaults to '' since the column is NOT NULL.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { first_name, last_name, birth_date } = body;

        if (!first_name || !last_name) {
            return NextResponse.json(
                { error: 'first_name e last_name sono obbligatori' },
                { status: 400 }
            );
        }

        const trimmedFirst = first_name.trim();
        const trimmedLast = last_name.trim();

        // 1. Try to find an existing customer by strict match: first_name + last_name + birth_date
        let query = supabaseAdmin
            .from('customers')
            .select('id')
            .ilike('first_name', trimmedFirst)
            .ilike('last_name', trimmedLast);

        if (birth_date) {
            query = query.eq('birth_date', birth_date);
        }

        const { data: candidates } = await query;

        if (candidates && candidates.length > 0) {
            // Customer already exists — update their details with the fresh data
            const existingId = candidates[0].id;

            const updatePayload: Record<string, any> = {};
            // Only update non-null values so we don't accidentally clear existing data
            if (body.birth_date) updatePayload.birth_date = body.birth_date;
            if (body.birth_country) updatePayload.birth_country = body.birth_country;
            if (body.birth_province) updatePayload.birth_province = body.birth_province;
            if (body.birth_city) updatePayload.birth_city = body.birth_city;
            if (body.gender) updatePayload.gender = body.gender;
            if (body.citizenship) updatePayload.citizenship = body.citizenship;
            if (body.address) updatePayload.address = body.address;
            if (body.residence_country) updatePayload.residence_country = body.residence_country;
            if (body.residence_province) updatePayload.residence_province = body.residence_province;
            if (body.residence_city) updatePayload.residence_city = body.residence_city;
            if (body.residence_zip) updatePayload.residence_zip = body.residence_zip;
            if (body.document_type) updatePayload.document_type = body.document_type;
            if (body.document_number) updatePayload.document_number = body.document_number;
            if (body.document_issue_date) updatePayload.document_issue_date = body.document_issue_date;
            if (body.document_issuer) updatePayload.document_issuer = body.document_issuer;
            if (body.document_issue_city) updatePayload.document_issue_city = body.document_issue_city;
            if (body.document_issue_country) updatePayload.document_issue_country = body.document_issue_country;
            if (body.license_plate) updatePayload.license_plate = body.license_plate;

            if (Object.keys(updatePayload).length > 0) {
                const { error: updateError } = await supabaseAdmin
                    .from('customers')
                    .update(updatePayload)
                    .eq('id', existingId);

                if (updateError) {
                    await logToDb('warn', '[upsert-guest] Failed to update secondary guest customer', {
                        customer_id: existingId,
                        guest_name: `${trimmedFirst} ${trimmedLast}`,
                        error: updateError.message,
                        code: updateError.code,
                    });
                    console.warn('[upsert-guest] Update error (non-fatal):', updateError.message);
                }
            }

            console.log(`✅ [upsert-guest] Updated existing customer: ${trimmedFirst} ${trimmedLast} (${existingId})`);
            return NextResponse.json({ id: existingId, action: 'updated' });

        } else {
            // 2. No match found — create a new customer
            // Note: phone is NOT NULL in DB; secondary guests don't have one, so we use '' as placeholder.
            const insertPayload: Record<string, any> = {
                first_name: trimmedFirst,
                last_name: trimmedLast,
                phone: '', // Secondary guests have no phone at check-in time
            };

            // Optionally populate all extra fields if provided
            if (body.birth_date) insertPayload.birth_date = body.birth_date;
            if (body.birth_country) insertPayload.birth_country = body.birth_country;
            if (body.birth_province) insertPayload.birth_province = body.birth_province;
            if (body.birth_city) insertPayload.birth_city = body.birth_city;
            if (body.gender) insertPayload.gender = body.gender;
            if (body.citizenship) insertPayload.citizenship = body.citizenship;
            if (body.address) insertPayload.address = body.address;
            if (body.residence_country) insertPayload.residence_country = body.residence_country;
            if (body.residence_province) insertPayload.residence_province = body.residence_province;
            if (body.residence_city) insertPayload.residence_city = body.residence_city;
            if (body.residence_zip) insertPayload.residence_zip = body.residence_zip;
            if (body.document_type) insertPayload.document_type = body.document_type;
            if (body.document_number) insertPayload.document_number = body.document_number;
            if (body.document_issue_date) insertPayload.document_issue_date = body.document_issue_date;
            if (body.document_issuer) insertPayload.document_issuer = body.document_issuer;
            if (body.document_issue_city) insertPayload.document_issue_city = body.document_issue_city;
            if (body.document_issue_country) insertPayload.document_issue_country = body.document_issue_country;
            if (body.license_plate) insertPayload.license_plate = body.license_plate;

            const { data: newCustomer, error: insertError } = await supabaseAdmin
                .from('customers')
                .insert(insertPayload)
                .select('id')
                .single();

            if (insertError || !newCustomer) {
                await logToDb('error', '[upsert-guest] Failed to create secondary guest as customer', {
                    guest_name: `${trimmedFirst} ${trimmedLast}`,
                    error: insertError?.message,
                    code: insertError?.code,
                    hint: insertError?.hint,
                    payload_keys: Object.keys(insertPayload),
                });
                await logToDb('error', '[upsert-guest] Error creating customer:', insertError);
                console.error('[upsert-guest] Error creating customer:', insertError);
                return NextResponse.json(
                    { error: 'Errore durante la creazione del cliente secondario', detail: insertError?.message },
                    { status: 500 }
                );
            }

            console.log(`🆕 [upsert-guest] Created new customer: ${trimmedFirst} ${trimmedLast} (${newCustomer.id})`);
            return NextResponse.json({ id: newCustomer.id, action: 'created' }, { status: 201 });
        }

    } catch (error: any) {
        await logToDb('error', '[upsert-guest] Unexpected uncaught error', {
            error: error?.message || String(error),
            stack: error?.stack?.slice(0, 500),
        });
        await logToDb('error', '[upsert-guest] Unexpected error:', error);
        console.error('[upsert-guest] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
