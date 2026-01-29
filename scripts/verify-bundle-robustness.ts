import { calculatePrice, CalculationContext } from '../src/lib/pricing';
import { GroupBundle, PricingSeason } from '../src/lib/types';

// ==========================================
// MOCK DATA SETUP
// ==========================================

// Season 1: Low Season (June)
const lowSeason: PricingSeason = {
    id: 'season-low',
    name: 'Low Season',
    color: '#00ff00',
    start_date: '2025-06-01',
    end_date: '2025-06-30',
    piazzola_price_per_day: 10,
    person_price_per_day: 5,
    tenda_price_per_day: 5,
    child_price_per_day: 3,
    dog_price_per_day: 2,
    car_price_per_day: 2,
    priority: 10,
    is_active: true,
    description: null,
    created_at: '',
    updated_at: ''
};

// Season 2: High Season (August)
const highSeason: PricingSeason = {
    id: 'season-high',
    name: 'High Season',
    color: '#ff0000',
    start_date: '2025-08-01',
    end_date: '2025-08-31',
    piazzola_price_per_day: 20, // Double price
    person_price_per_day: 10,
    tenda_price_per_day: 10,
    child_price_per_day: 6,
    dog_price_per_day: 4,
    car_price_per_day: 4,
    priority: 20, // Higher priority
    is_active: true,
    description: null,
    created_at: '',
    updated_at: ''
};

// Bundle A: Low Season - 3 Nights - 25 EUR (Standard would be 30 EUR for pitch)
const bundleLow: GroupBundle = {
    id: 'bundle-low-3',
    group_id: 'group-1',
    season_id: 'season-low',
    nights: 3,
    pitch_price: 25,
    unit_prices: {}, // Extras are standard
    created_at: '',
    updated_at: ''
};

// Bundle B: High Season - 3 Nights - 50 EUR (Standard would be 60 EUR for pitch)
const bundleHigh: GroupBundle = {
    id: 'bundle-high-3',
    group_id: 'group-1',
    season_id: 'season-high',
    nights: 3,
    pitch_price: 50,
    unit_prices: {},
    created_at: '',
    updated_at: ''
};

const allBundles = [bundleLow, bundleHigh];
const allSeasons = [lowSeason, highSeason];

// ==========================================
// TEST RUNNER
// ==========================================

const runTest = (
    name: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    expectedPrice: number,
    description: string
) => {
    const context: CalculationContext = {
        seasons: allSeasons,
        guests,
        children: 0,
        dogs: 0,
        cars: 0,
        groupConfigs: [],
        bundles: allBundles
    };

    const price = calculatePrice(checkIn, checkOut, 'piazzola', context);
    const passed = Math.abs(price - expectedPrice) < 0.01;

    console.log(`[${name}]`);
    console.log(`Desc: ${description}`);
    console.log(`Dates: ${checkIn} -> ${checkOut} (Guests: ${guests})`);
    console.log(`Expected: ${expectedPrice} € | Got: ${price} €`);
    console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---------------------------------------------------');
    return passed;
};

// ==========================================
// SCENARIOS
// ==========================================

console.log('\n🔍 VERIFYING BUNDLE ROBUSTNESS & SEASONALITY\n');

// 1. Low Season Bundle Test
// CheckIn: June 1st, 3 nights.
// Standard: (10 pitch + 5*2 persons) * 3 = 20 * 3 = 60.
// Bundle: 25 (Pitch) + (5*2 persons * 3) = 25 + 30 = 55.
// WAIT! 
// My implementation says: "zeroRated = ['piazzola', 'person', 'child']" for bundles!
// Line 219 in src/lib/pricing.ts: zeroRated = ['piazzola', 'person', 'child'];
// So Pitch Price INCLUDES persons. 
// So Low Season Bundle Price (3 nights) = 25 EUR total.
// Let's verify this Logic.
runTest(
    'Low Season 3-Night Bundle',
    '2025-06-01', '2025-06-04',
    2,
    25,
    'Booking matches Low Season Bundle (3 nights). Should use bundle price (25€) which includes persons.'
);

// 2. High Season Bundle Test
// CheckIn: August 1st, 3 nights.
// Bundle Price: 50 EUR.
runTest(
    'High Season 3-Night Bundle',
    '2025-08-01', '2025-08-04',
    2,
    50,
    'Booking matches High Season Bundle (3 nights). Should use bundle price (50€).'
);

// 3. Fallback (Too short for bundle)
// Low Season, 2 nights.
// Standard Rates: Pitch 10, Person 5.
// (10 + 5*2) * 2 = 20 * 2 = 40.
runTest(
    'Low Season 2 Nights (No Bundle)',
    '2025-06-01', '2025-06-03',
    2,
    40,
    'Stay is shorter than bundle requirements. Should fallback to standard seasonal pricing.'
);

// 4. Extended Stay (Bundle + Standard)
// Low Season, 4 nights.
// First 3 nights = Bundle (25).
// 4th night = Standard (10 + 5*2 = 20).
// Total = 45.
runTest(
    'Low Season 4 Nights (Bundle + 1 Night)',
    '2025-06-01', '2025-06-05',
    2,
    45,
    'Stay exceeds bundle. Should apply bundle for first 3 nights, then standard rate for the extra night.'
);

// 5. Cross Season (Advanced) - Not supported by "Active Bundle" logic yet?
// src/lib/pricing.ts: "Determine applicable season for Check-In... Filter bundles for THIS season".
// If checkin is June 30 (Low), checkout July 3 (No season/Base).
// It picks bundle based on CHECK-IN date.
// So if I check in June 30 for 3 nights...
// Bundle Low applies (3 nights). 
// Price: 25.
// Even if days overlap into another season?
// The loop `while (currentDate < endDate)` recalculates season cost daily.
// BUT `activeBundle` is determined ONCE at start based on duration and check-in season.
// `if (activeBundle && daysProcessed <= activeBundle.nights)` -> Appplies bundle price.
// So yes, it honors the bundle "locked in" at check-in.
// Let's verify.
runTest(
    'Cross Season Check-in',
    '2025-06-29', '2025-07-02',
    2,
    25,
    'Check-in is inside Low Season. Bundle applies for 3 nights, even if it crosses out of season definition? Logic suggests yes.'
);

console.log('\nTests Completed.');
