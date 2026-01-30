-- ============================================
-- ABILITA RLS SU TUTTE LE TABELLE
-- ============================================

ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY PER PITCHES (Piazzole)
-- ============================================

CREATE POLICY "Authenticated users have full access to pitches"
ON public.pitches
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLICY PER BOOKINGS (Prenotazioni)
-- ============================================

CREATE POLICY "Authenticated users have full access to bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLICY PER SECTORS (Settori)
-- ============================================

CREATE POLICY "Authenticated users have full access to sectors"
ON public.sectors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLICY PER PRICING_SEASONS (Stagioni Prezzo)
-- ============================================

CREATE POLICY "Authenticated users have full access to pricing_seasons"
ON public.pricing_seasons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLICY PER CUSTOMERS (Clienti)
-- ============================================

CREATE POLICY "Authenticated users have full access to customers"
ON public.customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLICY PER BOOKING_GUESTS (Ospiti Prenotazioni)
-- ============================================

CREATE POLICY "Authenticated users have full access to booking_guests"
ON public.booking_guests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);