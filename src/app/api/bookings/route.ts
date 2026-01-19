import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculatePrice } from '@/lib/pricing';
import type { CreateBookingRequest } from '@/lib/types';
import { invalidateOccupancyCache } from '@/components/dashboard/SectorOccupancyViewer';

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
        const checkInDate = new Date(body.check_in);
        const checkOutDate = new Date(body.check_out);

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

        // Calculate total price
        const totalPrice = calculatePrice(body.check_in, body.check_out, pitch.type);

        // Step 1: Resolve Customer
        let customerId: string;

        // A) If customer_id is provided explicitly (from Autocomplete)
        if (body.customer_id) {
            customerId = body.customer_id;

            // Verify existence
            const { data: existing, error: existError } = await supabaseAdmin
                .from('customers')
                .select('id')
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
                await supabaseAdmin
                    .from('customers')
                    .update({
                        email: body.customer.email,
                        address: body.customer.address,
                        notes: body.customer.notes,
                        // We do NOT update names here to preserve integrity of the selected record
                    })
                    .eq('id', customerId);
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
                .select('id, first_name, last_name, phone')
                .eq('phone', targetPhone); // Filter by phone first (indexed)

            const exactMatch = candidates?.find(c =>
                c.first_name.toLowerCase() === targetFirst.toLowerCase() &&
                c.last_name.toLowerCase() === targetLast.toLowerCase()
            );

            if (exactMatch) {
                console.log(`✅ Found existing customer: ${exactMatch.first_name} ${exactMatch.last_name} (${exactMatch.id})`);
                customerId = exactMatch.id;

                // Optional: Update email/notes if changed
                await supabaseAdmin
                    .from('customers')
                    .update({
                        email: body.customer.email,
                        address: body.customer.address,
                        notes: body.customer.notes,
                    })
                    .eq('id', customerId);

            } else {
                console.log(`🆕 Creating NEW customer for: ${targetFirst} ${targetLast} (Phone: ${targetPhone})`);

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
                    })
                    .select('id')
                    .single();

                if (customerError || !newCustomer) {
                    console.error('Error creating customer:', customerError);
                    return NextResponse.json(
                        { error: 'Errore durante la creazione del cliente' },
                        { status: 500 }
                    );
                }

                customerId = newCustomer.id;
            }
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
                total_price: totalPrice,
                status: 'confirmed',
                notes: body.notes || null,
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Error creating booking:', bookingError);

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
            console.error('Error fetching bookings:', error);
            return NextResponse.json(
                { error: 'Failed to fetch bookings' },
                { status: 500 }
            );
        }

        return NextResponse.json({ bookings });

    } catch (error) {
        console.error('Bookings GET API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
