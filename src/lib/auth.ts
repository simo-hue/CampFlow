/**
 * Session authentication utilities (CampFlow).
 *
 * Replaces the previous "cookie just needs to exist with value 'true'" scheme
 * with an unforgeable, expiring, HMAC-SHA256-signed token.
 *
 * IMPORTANT: this module must stay Edge-runtime compatible (it is imported by
 * `middleware.ts`). Only Web Crypto / TextEncoder / btoa-atob are used — no
 * Node built-ins.
 *
 * Token format:  base64url(payloadJSON) + "." + base64url(HMAC_SHA256(payloadB64, secret))
 * Payload:       { sub: "admin", exp: <epoch-ms> }
 *
 * The signing secret is AUTH_SECRET, falling back to ADMIN_PASSWORD so the app
 * keeps working without a new env var (rotating either invalidates sessions).
 */

export const MAIN_AUTH_COOKIE = 'campflow_auth';
export const SYS_MONITOR_AUTH_COOKIE = 'sys_monitor_auth';

const encoder = new TextEncoder();

function getSecret(): string {
    const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) {
        throw new Error('AUTH_SECRET (or ADMIN_PASSWORD) must be set to sign/verify sessions.');
    }
    return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function hmacSha256(data: string, secret: string): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return new Uint8Array(signature);
}

/** Constant-time string comparison to avoid signature-timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

/** Creates a signed session token valid for `maxAgeSeconds` (default 7 days). */
export async function createSessionToken(maxAgeSeconds: number = 60 * 60 * 24 * 7): Promise<string> {
    const payload = { sub: 'admin', exp: Date.now() + maxAgeSeconds * 1000 };
    const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
    const signature = bytesToBase64Url(await hmacSha256(payloadB64, getSecret()));
    return `${payloadB64}.${signature}`;
}

/** Returns true only for a token with a valid signature that has not expired. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;

    let expected: string;
    try {
        expected = bytesToBase64Url(await hmacSha256(payloadB64, getSecret()));
    } catch {
        return false; // secret missing / crypto unavailable
    }
    if (!timingSafeEqual(signature, expected)) return false;

    try {
        const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
        return typeof payload.exp === 'number' && Date.now() <= payload.exp;
    } catch {
        return false;
    }
}
