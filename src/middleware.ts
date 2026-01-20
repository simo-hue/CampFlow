import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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

    // 3. Allow access to login page and auth apis
    if (pathname === '/login' || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // 4. Check for Authentication Cookie
    // The 'sys_monitor_auth' cookie is currently used. 
    // We can migrate to 'campflow_auth' later, but for minimal friction let's respect the existing one or look for a new one.
    // Let's use 'campflow_auth' as the standard moving forward, but for now I'll check both or just set a new one in the universal login.
    const authToken = request.cookies.get('campflow_auth')?.value;

    if (!authToken) {
        // Redirect to website if not authenticated
        const url = request.nextUrl.clone();
        url.pathname = '/w';
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
