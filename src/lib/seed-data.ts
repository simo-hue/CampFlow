
export const DEFAULT_PITCHES = [
    // Piazzole standard (001-005)
    { number: '001', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true }, status: 'available' },
    { number: '002', suffix: '', type: 'piazzola', attributes: { shade: false, electricity: true, water: true }, status: 'available' },
    { number: '003', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true, sewer: true }, status: 'available' },
    { number: '004', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: false }, status: 'available' },
    { number: '005', suffix: '', type: 'piazzola', attributes: { shade: false, electricity: true, water: true }, status: 'available' },

    // Tende (101-105)
    { number: '101', suffix: '', type: 'tenda', attributes: { shade: true, electricity: false }, status: 'available' },
    { number: '102', suffix: '', type: 'tenda', attributes: { shade: false, electricity: false }, status: 'available' },
    { number: '103', suffix: '', type: 'tenda', attributes: { shade: true, electricity: true }, status: 'available' },
    { number: '104', suffix: '', type: 'tenda', attributes: { shade: true, electricity: false }, status: 'available' },
    { number: '105', suffix: '', type: 'tenda', attributes: { shade: false, electricity: true }, status: 'available' },

    // Altre Piazzole (201-205)
    { number: '201', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true, size_sqm: 80 }, status: 'available' },
    { number: '202', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true, size_sqm: 100 }, status: 'available' },
    { number: '203', suffix: '', type: 'piazzola', attributes: { shade: false, electricity: true, water: true, size_sqm: 90 }, status: 'available' },
    { number: '204', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true, sewer: true, size_sqm: 120 }, status: 'available' },
    { number: '205', suffix: '', type: 'piazzola', attributes: { shade: true, electricity: true, water: true, size_sqm: 85 }, status: 'available' }
];

export const DEFAULT_SEASONS = [
    // Bassa Stagione Inverno
    {
        name: 'Bassa Stagione',
        description: 'Inverno - Gennaio a Aprile',
        start_date: '2026-01-01',
        end_date: '2026-04-30',
        piazzola_price_per_day: 20.00,
        tenda_price_per_day: 15.00,
        priority: 0,
        color: '#94a3b8',
        is_active: true
    },
    // Media Stagione Primavera
    {
        name: 'Media Stagione',
        description: 'Primavera - Maggio',
        start_date: '2026-05-01',
        end_date: '2026-05-31',
        piazzola_price_per_day: 30.00,
        tenda_price_per_day: 20.00,
        priority: 5,
        color: '#fbbf24',
        is_active: true
    },
    // Alta Stagione Estate
    {
        name: 'Alta Stagione',
        description: 'Estate - Giugno ad Agosto',
        start_date: '2026-06-01',
        end_date: '2026-08-31',
        piazzola_price_per_day: 40.00,
        tenda_price_per_day: 25.00,
        priority: 10,
        color: '#ef4444',
        is_active: true
    },
    // Media Stagione Autunno
    {
        name: 'Media Stagione',
        description: 'Autunno - Settembre',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        piazzola_price_per_day: 30.00,
        tenda_price_per_day: 20.00,
        priority: 5,
        color: '#fbbf24',
        is_active: true
    },
    // Bassa Stagione Fine Anno
    {
        name: 'Bassa Stagione',
        description: 'Fine Anno - Ottobre a Dicembre',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
        piazzola_price_per_day: 20.00,
        tenda_price_per_day: 15.00,
        priority: 0,
        color: '#94a3b8',
        is_active: true
    },
    // Ferragosto
    {
        name: 'Ferragosto',
        description: 'Picco stagionale estivo',
        start_date: '2026-08-10',
        end_date: '2026-08-20',
        piazzola_price_per_day: 50.00,
        tenda_price_per_day: 30.00,
        priority: 20,
        color: '#dc2626',
        is_active: true
    },
    // Natale
    {
        name: 'Natale',
        description: 'Festività natalizie',
        start_date: '2026-12-20',
        end_date: '2027-01-06',
        piazzola_price_per_day: 35.00,
        tenda_price_per_day: 25.00,
        priority: 15,
        color: '#10b981',
        is_active: true
    }
];
