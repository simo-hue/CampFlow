import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, MAIN_AUTH_COOKIE } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public access to the showcase website (/w/*)
    if (pathname.startsWith('/w')) {
        return NextResponse.next();
    }

    // 2. Allow public access to nextjs internals, static assets, and favicon
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname === '/favicon.ico' ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/) // Relaxed asset check
    ) {
        return NextResponse.next();
    }

    // 3. Allow access to login page, auth apis, and system monitor (it has its own auth)
    if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname.startsWith('/sys-monitor')) {
        return NextResponse.next();
    }

    // 4. Verify the signed authentication cookie (HMAC-signed + expiring).
    //    Presence is not enough — the signature must validate (see src/lib/auth.ts).
    const authToken = request.cookies.get(MAIN_AUTH_COOKIE)?.value;
    const isValid = await verifySessionToken(authToken);

    if (!isValid) {
        // If it's an API route (and not in the allows list), return 401 (JSON), else Redirect
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Redirect to login if not authenticated (Standard App Behavior)
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 5. Allow authorized request
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> actually we WANT to protect API routes mostly, except specific ones.
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
