import { calculatePrice, CalculationContext } from '../src/lib/pricing';
import { GroupBundle, PricingSeason } from '../src/lib/types';

// Mock Data
const mockSeason: PricingSeason = {
    id: 'season-1',
    name: 'High Season',
    color: '#ff0000',
    start_date: '2025-06-01',
    end_date: '2025-08-31',
    piazzola_price_per_day: 10,
    tenda_price_per_day: 8,
    person_price_per_day: 5,
    child_price_per_day: 3,
    dog_price_per_day: 2,
    car_price_per_day: 2,
    priority: 1,
    is_active: true,
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const mockBundles: GroupBundle[] = [
    {
        id: 'bundle-2-nights',
        group_id: 'group-1',
        nights: 2,
        pitch_price: 25,
        unit_prices: {}, // Empty means standard rates apply for extras? Or maybe we can bundle persons?
        // Let's test a bundle that includes pitch cost (25 total for 2 nights) and leaves extras standard.
        // Base pitch standard = 10*2 = 20. Bundle 25 is actually more expensive? 
        // Let's say bundle is 15.
        // pitch_price: 15.
        created_at: '',
        updated_at: ''
    },
    {
        id: 'bundle-7-nights',
        group_id: 'group-1',
        nights: 7,
        pitch_price: 50, // 50 for 7 nights pitch (approx 7.14/night vs 10 std)
        unit_prices: {
            person: 0, // Person is FREE in this bundle!
            dog: 10 // Dog is 10 euro FLAT for 7 nights (vs 2*7=14 std)
        },
        created_at: '',
        updated_at: ''
    }
];

// Correct Bundle 2 price
mockBundles[0].pitch_price = 15;

const runTest = (name: string, checkIn: string, checkOut: string, guests: number, expectedPrice: number, bundles: GroupBundle[] = [], dogs: number = 0) => {
    const context: CalculationContext = {
        seasons: [mockSeason],
        guests,
        children: 0,
        dogs: dogs,
        cars: 0,
        groupConfigs: [],
        bundles
    };

    const price = calculatePrice(checkIn, checkOut, 'piazzola', context);
    // Allow small float error
    const passed = Math.abs(price - expectedPrice) < 0.01;

    console.log(`Test: ${name}`);
    console.log(`  Expected: ${expectedPrice}, Got: ${price}`);
    console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---');
    return passed;
};

async function main() {
    console.log('Running Pricing Bundle Tests...\n');

    // Scenario 1: No Bundle, 2 nights, 2 guests
    // Base: 10 (pitch) + 5*2 (people) = 20/day. Total 40.
    runTest('No Bundle (Standard)', '2025-06-01', '2025-06-03', 2, 40, []);

    // Scenario 2: Bundle 2 nights (Pitch 15, Extras Standard), 2 nights stay, 2 guests
    // Bundle Pitch: 15.
    // Persons (Bundle): INCLUDED (0).
    // Total: 15.
    runTest('Bundle 2 Nights (Pitch Deal)', '2025-06-01', '2025-06-03', 2, 15, mockBundles);

    // Scenario 3: Bundle 7 nights (Pitch 50, Person 0, Dog 10), 7 nights stay, 2 guests, 1 dog
    // Bundle Pitch: 50.
    // Person (Bundle): INCLUDED (0).
    // Dog: 10 (Unit price 10).
    // Total: 50 + 10 = 60.
    runTest('Bundle 7 Nights (Complex)', '2025-06-01', '2025-06-08', 2, 60, mockBundles, 1);

    // Scenario 4: Bundle 2 nights + 1 Extra Night
    // Stay 3 nights.
    // First 2 nights: Bundle (15). Persons included.
    // Day 3 (Standard): Pitch (10) + 2 Persons (10) = 20.
    // Total: 15 + 20 = 35.
    runTest('Bundle 2 Nights + 1 Extra Night', '2025-06-01', '2025-06-04', 2, 35, mockBundles);
}

main().catch(console.error);
