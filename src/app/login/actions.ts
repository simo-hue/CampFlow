'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'campflow_auth';

export async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
        return { error: 'Server authentication is not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD env vars.' };
    }

    if (username === validUsername && password === validPassword) {
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Also set the old cookie to keep sys-monitor happy without re-login if it checks strictly
        // although my new middleware handles protections, sys-monitor might have its own checks.
        // I will rely on the new middleware for everything, but let's be safe.
        // Actually, sys-monitor/login/actions.ts checks 'sys_monitor_auth'.
        // I should probably unify this. For now, I'll set both to be safe.
        cookieStore.set('sys_monitor_auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        // Redirect to original destination if possible, else /
        // For now, redirect to /
        redirect('/');
    } else {
        return { error: 'Invalid Credentials' };
    }
}
