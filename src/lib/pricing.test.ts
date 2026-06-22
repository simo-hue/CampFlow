import { describe, it, expect } from 'vitest';
import { getApplicableSeason, calculatePrice } from '@/lib/pricing';
import type { PricingSeason } from '@/lib/types';

function season(partial: Partial<PricingSeason>): PricingSeason {
    return {
        id: 'id',
        name: 'Season',
        description: null,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        piazzola_price_per_day: 10,
        tenda_price_per_day: 8,
        person_price_per_day: 5,
        child_price_per_day: 3,
        dog_price_per_day: 2,
        car_price_per_day: 3,
        priority: 0,
        color: '#000000',
        is_active: true,
        is_recurring: false,
        created_at: '',
        updated_at: '',
        ...partial,
    };
}

describe('getApplicableSeason', () => {
    it('returns the active season covering the date', () => {
        const s = season({ id: 'base', start_date: '2026-06-01', end_date: '2026-06-30' });
        expect(getApplicableSeason(new Date('2026-06-15'), [s])?.id).toBe('base');
    });

    it('prefers the highest-priority season on overlap', () => {
        const low = season({ id: 'low', priority: 0 });
        const high = season({ id: 'high', priority: 10, start_date: '2026-06-01', end_date: '2026-06-30' });
        expect(getApplicableSeason(new Date('2026-06-15'), [low, high])?.id).toBe('high');
    });

    it('ignores inactive seasons', () => {
        const s = season({ id: 'off', is_active: false, start_date: '2026-06-01', end_date: '2026-06-30' });
        expect(getApplicableSeason(new Date('2026-06-15'), [s])).toBeUndefined();
    });

    it('matches recurring seasons year-independently', () => {
        const s = season({ id: 'rec', is_recurring: true, start_date: '2020-06-01', end_date: '2020-06-30' });
        expect(getApplicableSeason(new Date('2030-06-15'), [s])?.id).toBe('rec');
    });
});

describe('calculatePrice', () => {
    it('throws when checkout is not after checkin', () => {
        expect(() => calculatePrice('2026-06-10', '2026-06-10', 'piazzola', { seasons: [season({})] })).toThrow();
    });

    it('sums pitch + guests for a single night', () => {
        // piazzola 10 + 2 persons * 5 = 20
        const total = calculatePrice('2026-06-10', '2026-06-11', 'piazzola', { seasons: [season({})], guests: 2 });
        expect(total).toBe(20);
    });

    it('multiplies the pitch rate across multiple nights', () => {
        // 3 nights * piazzola 10 = 30
        const total = calculatePrice('2026-06-10', '2026-06-13', 'piazzola', { seasons: [season({})], guests: 0 });
        expect(total).toBe(30);
    });

    it('returns 0 when no season covers the dates', () => {
        const s = season({ start_date: '2026-01-01', end_date: '2026-01-31' });
        const total = calculatePrice('2026-06-10', '2026-06-11', 'piazzola', { seasons: [s], guests: 2 });
        expect(total).toBe(0);
    });
});
