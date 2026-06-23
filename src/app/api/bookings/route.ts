import { NextRequest, NextResponse } from 'next/server';
import { logToDb } from '@/lib/logger-server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculateBookingPrice } from '@/lib/bookingPricing';
import { parseISO } from 'date-fns';
import type { CreateBookingRequest } from '@/lib/types';

function normalizeCustomerGroupId(groupId: unknown): string | null | undefined {
    if (groupId === undefined) return undefined;
    if (groupId === null || groupId === '' || groupId === 'none') return null;
    return String(groupId);
}

function buildExistingCustomerUpdates(customer: CreateBookingRequest['customer']) {
    const updates: Record<string, unknown> = {};

    if (customer.email !== undefined) updates.email = customer.email;
    if (customer.address !== undefined) updates.address = customer.address;
    if (customer.notes !== undefined) updates.notes = customer.notes;
    if (customer.license_plate !== undefined) updates.license_plate = customer.license_plate;

    const groupId = normalizeCustomerGroupId(customer.group_id);
    if (groupId !== undefined) updates.group_id = groupId;

    return updates;
}

/**
 * POST /api/bookings
 * 
 * Creates a new booking with customer information
 * Handles atomic transaction for customer + booking creation
 * Returns PostgreSQL constraint error if overbooking is attempted
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateBookingRequest = await request.json();

        // Validation
        if (!body.pitch_id || !body.customer || !body.check_in || !body.check_out || !body.guests_count) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate dates
        const checkInDate = parseISO(body.check_in);
        const checkOutDate = parseISO(body.check_out);

        if (checkInDate >= checkOutDate) {
            return NextResponse.json(
                { error: 'La data di partenza deve essere successiva alla data di arrivo' },
                { status: 400 }
            );
        }

        // Validate guests count
        if (body.guests_count < 1 || body.guests_count > 20) {
            return NextResponse.json(
                { error: 'Il numero di ospiti deve essere tra 1 e 20' },
                { status: 400 }
            );
        }

        // Get pitch information to determine type for pricing
        const { data: pitch, error: pitchError } = await supabaseAdmin
            .from('pitches')
            .select('type')
            .eq('id', body.pitch_id)
            .single();

        if (pitchError || !pitch) {
            return NextResponse.json(
                { error: 'Piazzola non trovata' },
                { status: 404 }
            );
        }

        // Step 1: Resolve Customer
        let customerId: string;
        let effectiveCustomerGroupId: string | null = null;
        let createdNewCustomerId: string | null = null; // set only when we INSERT a new customer (for rollback)

        // A) If customer_id is provided explicitly (from Autocomplete)
        if (body.customer_id) {
            customerId = body.customer_id;

            // Verify existence
            const { data: existing, error: existError } = await supabaseAdmin
                .from('customers')
                .select('id, group_id')
                .eq('id', customerId)
                .single();

            if (existError || !existing) {
                return NextResponse.json(
                    { error: 'Cliente selezionato non trovato' },
                    { status: 404 }
                );
            }

            // Update auxiliary details if provided (non-destructive)
            if (body.customer) {
                const requestedGroupId = normalizeCustomerGroupId(body.customer.group_id);
                effectiveCustomerGroupId = requestedGroupId !== undefined ? requestedGroupId : existing.group_id || null;

                const customerUpdates = buildExistingCustomerUpdates(body.customer);

                if (Object.keys(customerUpdates).length > 0) {
                    const { error: customerUpdateError } = await supabaseAdmin
                        .from('customers')
                        .update(customerUpdates)
                        .eq('id', customerId);

                    if (customerUpdateError) {
                        await logToDb('error', 'Error updating customer:', customerUpdateError);
                        console.error('Error updating customer:', customerUpdateError);
                        return NextResponse.json(
                            { error: 'Errore durante l\'aggiornamento del cliente' },
                            { status: 500 }
                        );
                    }
                }
            } else {
                effectiveCustomerGroupId = existing.group_id || null;
            }

        } else {
            // B) No ID provided -> Try to find by STRICT MATCH (Phone + First Name + Last Name)
            // This prevents overwriting different people who coincidentally share a phone matches

            // Clean inputs for comparison
            const targetPhone = body.customer.phone.trim();
            const targetFirst = body.customer.first_name.trim();
            const targetLast = body.customer.last_name.trim();

            const { data: candidates } = await supabaseAdmin
                .from('customers')
                .select('id, first_name, last_name, phone, group_id')
                .eq('phone', targetPhone); // Filter by phone first (indexed)

            const exactMatch = candidates?.find(c =>
                c.first_name.toLowerCase() === targetFirst.toLowerCase() &&
                c.last_name.toLowerCase() === targetLast.toLowerCase()
            );

            if (exactMatch) {
                console.log(`✅ Found existing customer: ${exactMatch.last_name} ${exactMatch.first_name} (${exactMatch.id})`);
                customerId = exactMatch.id;
                const requestedGroupId = normalizeCustomerGroupId(body.customer.group_id);
                effectiveCustomerGroupId = requestedGroupId !== undefined ? requestedGroupId : exactMatch.group_id || null;

                // Optional: Update email/notes if changed
                const customerUpdates = buildExistingCustomerUpdates(body.customer);

                if (Object.keys(customerUpdates).length > 0) {
                    const { error: customerUpdateError } = await supabaseAdmin
                        .from('customers')
                        .update(customerUpdates)
                        .eq('id', customerId);

                    if (customerUpdateError) {
                        await logToDb('error', 'Error updating customer:', customerUpdateError);
                        console.error('Error updating customer:', customerUpdateError);
                        return NextResponse.json(
                            { error: 'Errore durante l\'aggiornamento del cliente' },
                            { status: 500 }
                        );
                    }
                }

            } else {
                console.log(`🆕 Creating NEW customer for: ${targetFirst} ${targetLast} (Phone: ${targetPhone})`);
                const requestedGroupId = normalizeCustomerGroupId(body.customer.group_id);
                effectiveCustomerGroupId = requestedGroupId || null;

                // Create new customer
                const { data: newCustomer, error: customerError } = await supabaseAdmin
                    .from('customers')
                    .insert({
                        first_name: targetFirst,
                        last_name: targetLast,
                        email: body.customer.email,
                        phone: targetPhone,
                        address: body.customer.address,
                        notes: body.customer.notes,
                        license_plate: body.customer.license_plate,
                        group_id: effectiveCustomerGroupId
                    })
                    .select('id')
                    .single();

                if (customerError || !newCustomer) {
                    await logToDb('error', 'Error creating customer:', customerError);
                    console.error('Error creating customer:', customerError);
                    return NextResponse.json(
                        { error: 'Errore durante la creazione del cliente' },
                        { status: 500 }
                    );
                }

                customerId = newCustomer.id;
                createdNewCustomerId = newCustomer.id; // track for rollback if the booking insert fails
            }
        }

        let totalPrice = body.total_price;

        if (!body.is_manual_price) {
            totalPrice = await calculateBookingPrice({
                checkIn: body.check_in,
                checkOut: body.check_out,
                pitchType: pitch.type,
                guestsCount: body.guests_count,
                childrenCount: body.children_count,
                dogsCount: body.dogs_count,
                carsCount: body.cars_count,
                groupId: effectiveCustomerGroupId,
            });
        }

        // 3. Crea la prenotazione usando daterange
        const bookingPeriod = `[${body.check_in},${body.check_out})`;

        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                pitch_id: body.pitch_id,
                customer_id: customerId,
                booking_period: bookingPeriod,
                guests_count: body.guests_count,
                children_count: body.children_count || 0,
                dogs_count: body.dogs_count || 0,
                cars_count: body.cars_count || 0,
                total_price: totalPrice,
                is_manual_price: body.is_manual_price || false,
                status: 'confirmed',
                notes: body.notes || null,
            })
            .select()
            .single();

        if (bookingError) {
            await logToDb('error', 'Error creating booking:', bookingError);
            console.error('Error creating booking:', bookingError);

            // Compensating rollback: if we created a brand-new customer for THIS
            // booking, remove it so a failed booking (e.g. overbooking) does not
            // leave an orphaned customer record behind.
            if (createdNewCustomerId) {
                const { error: cleanupError } = await supabaseAdmin
                    .from('customers')
                    .delete()
                    .eq('id', createdNewCustomerId);
                if (cleanupError) {
                    await logToDb('warn', 'Failed to roll back orphaned customer after booking error', {
                        customerId: createdNewCustomerId,
                        message: cleanupError.message,
                    });
                }
            }

            // Check for exclusion constraint violation (overbooking)
            if (bookingError.code === '23P01') {
                return NextResponse.json(
                    {
                        error: 'Piazzola già occupata in questo periodo',
                        code: 'OVERBOOKING_PREVENTED'
                    },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: 'Errore durante la creazione della prenotazione' },
                { status: 500 }
            );
        }

        // 4. Insert initial guests (names only)
        if (body.guest_names && body.guest_names.length > 0) {
            const guestsToInsert = body.guest_names.map(name => ({
                booking_id: booking.id,
                full_name: name,
                guest_type: 'adult' // Default, can be updated at check-in
            }));

            const { error: guestsError } = await supabaseAdmin
                .from('booking_guests')
                .insert(guestsToInsert);

            if (guestsError) {
                await logToDb('error', 'Error inserting guests:', guestsError);
                console.error('Error inserting guests:', guestsError);
                // Non-critical: we continue even if guest names fail (user can add them at check-in)
            }
        }


        return NextResponse.json({
            id: booking.id,
            success: true,
            booking,
            message: 'Prenotazione creata con successo',

        }, { status: 201 });

    } catch (error) {
        await logToDb('error', 'Bookings API error:', error);
        console.error('Bookings API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/bookings
 * 
 * Retrieves bookings with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const pitchId = searchParams.get('pitch_id');
        const customerId = searchParams.get('customer_id');

        let query = supabaseAdmin
            .from('bookings')
            .select(`
        *,
        pitch:pitches(*),
        customer:customers(*),
        guests:booking_guests(*)
      `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (pitchId) {
            query = query.eq('pitch_id', pitchId);
        }

        if (customerId) {
            query = query.eq('customer_id', customerId);
        }

        const { data: bookings, error } = await query;

        if (error) {
            await logToDb('error', 'Error fetching bookings:', error);
            console.error('Error fetching bookings:', error);
            return NextResponse.json(
                { error: 'Failed to fetch bookings' },
                { status: 500 }
            );
        }

        return NextResponse.json({ bookings });

    } catch (error) {
        await logToDb('error', 'Bookings GET API error:', error);
        console.error('Bookings GET API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
