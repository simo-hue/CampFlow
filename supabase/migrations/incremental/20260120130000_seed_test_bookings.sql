-- =====================================================
-- CampFlow PMS - Seed Test Bookings
-- =====================================================
-- File: 20260120130000_seed_test_bookings.sql
-- Purpose: Generate random customers and bookings for testing
--          Covers last 3 months and next 1 month from NOW()
-- =====================================================

DO $$
DECLARE
    new_customer_id UUID;
    pitch_record RECORD;
    start_date DATE;
    end_date DATE;
    bk_status VARCHAR;
    i INT;
    
    -- Names for random generation
    first_names TEXT[] := ARRAY[
        'Alessandro', 'Lorenzo', 'Mattia', 'Leonardo', 'Francesco', 'Riccardo', 'Edoardo', 'Tommaso', 'Davide', 'Gabriele',
        'Sofia', 'Giulia', 'Aurora', 'Alice', 'Ginevra', 'Emma', 'Giorgia', 'Greta', 'Beatrice', 'Vittoria',
        'Mario', 'Luigi', 'Giovanni', 'Paolo', 'Roberto', 'Stefano', 'Marco', 'Antonio', 'Giuseppe', 'Luca'
    ];
    last_names TEXT[] := ARRAY[
        'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
        'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti',
        'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone'
    ];
    
    rand_fname TEXT;
    rand_lname TEXT;
    bk_period DATERANGE;
    
    -- Date calculations
    today DATE := CURRENT_DATE;
    
BEGIN
    -- 1. Create 50 Random Customers
    RAISE NOTICE 'Seeding customers...';
    
    FOR i IN 1..50 LOOP
        rand_fname := first_names[1 + floor(random() * array_length(first_names, 1))::int];
        rand_lname := last_names[1 + floor(random() * array_length(last_names, 1))::int];
        
        -- Replace space in bad surnames (e.g. De Luca -> deluca) for email
        INSERT INTO customers (
            first_name, 
            last_name, 
            email, 
            phone, 
            citizenship,
            birth_country,
            gender,
            created_at, 
            updated_at
        )
        VALUES (
            rand_fname, 
            rand_lname, 
            lower(rand_fname) || '.' || replace(lower(rand_lname), ' ', '') || i || '@example.test', 
            '+39 3' || floor(random() * 899999999 + 100000000)::text,
            'Italia',
            'Italia',
            CASE WHEN random() > 0.5 THEN 'M' ELSE 'F' END,
            NOW(), 
            NOW()
        );
    END LOOP;

    -- 2. Create Bookings (Attempt 300 to get a good fill despite overlaps)
    RAISE NOTICE 'Seeding bookings...';
    
    FOR i IN 1..300 LOOP
        -- Select a random customer
        SELECT id INTO new_customer_id FROM customers ORDER BY random() LIMIT 1;
        
        -- Select a random pitch (includes both 'piazzola' and 'tenda' types as they are all in pitches table)
        SELECT id, type, status INTO pitch_record FROM pitches WHERE status = 'available' ORDER BY random() LIMIT 1;
        
        -- Continue if we found resources
        IF new_customer_id IS NOT NULL AND pitch_record.id IS NOT NULL THEN
            
            -- Generate random start date within range [-90 days, +30 days]
            -- (today - 90) + [0..120] days
            start_date := today - 90 + floor(random() * 120)::int;
            
            -- Duration 2 to 14 days
            end_date := start_date + floor(random() * 12 + 2)::int;
            
            bk_period := daterange(start_date, end_date);
            
            -- Determine status based on dates
            IF end_date < today THEN
                bk_status := 'checked_out';
            ELSIF start_date <= today AND end_date > today THEN
                bk_status := 'checked_in';
            ELSE
                bk_status := 'confirmed';
            END IF;

            -- Attempt insert (wrapped in block to ignore overlaps)
            BEGIN
                INSERT INTO bookings (
                    pitch_id, 
                    customer_id, 
                    booking_period, 
                    guests_count, 
                    total_price, 
                    status, 
                    questura_sent,
                    created_at, 
                    updated_at
                )
                VALUES (
                    pitch_record.id,
                    new_customer_id,
                    bk_period,
                    floor(random() * 4 + 1)::int, -- 1-5 guests
                    floor(random() * 800 + 50)::numeric(10,2), -- price
                    bk_status,
                    (random() > 0.7), -- 30% chance sent
                    NOW(),
                    NOW()
                );
            EXCEPTION 
                WHEN exclusion_violation THEN 
                    -- Skip overlapping booking
                    NULL;
            END;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Seeding complete.';
END $$;
