import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth';

beforeAll(() => {
    process.env.AUTH_SECRET = 'test-secret-value';
});

describe('session tokens (C-1/C-2)', () => {
    it('verifies a freshly created token', async () => {
        const token = await createSessionToken(3600);
        expect(await verifySessionToken(token)).toBe(true);
    });

    it('rejects the old forged "true" cookie value', async () => {
        expect(await verifySessionToken('true')).toBe(false);
    });

    it('rejects empty / null / undefined / malformed tokens', async () => {
        expect(await verifySessionToken('')).toBe(false);
        expect(await verifySessionToken(null)).toBe(false);
        expect(await verifySessionToken(undefined)).toBe(false);
        expect(await verifySessionToken('a.b.c')).toBe(false);
    });

    it('rejects a tampered payload', async () => {
        const token = await createSessionToken(3600);
        const [payload, sig] = token.split('.');
        const tampered = `${payload.slice(0, -2)}XX.${sig}`;
        expect(await verifySessionToken(tampered)).toBe(false);
    });

    it('rejects a tampered signature', async () => {
        const token = await createSessionToken(3600);
        const [payload] = token.split('.');
        expect(await verifySessionToken(`${payload}.AAAA`)).toBe(false);
    });

    it('rejects an expired token', async () => {
        const expired = await createSessionToken(-10); // already in the past
        expect(await verifySessionToken(expired)).toBe(false);
    });

    it('rejects a token signed with a different secret', async () => {
        const token = await createSessionToken(3600);
        process.env.AUTH_SECRET = 'a-completely-different-secret';
        try {
            expect(await verifySessionToken(token)).toBe(false);
        } finally {
            process.env.AUTH_SECRET = 'test-secret-value';
        }
    });
});
