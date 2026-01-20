'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'sys_monitor_auth';

export async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
        return { error: 'Server authentication is not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD env vars.' };
    }

    if (username === validUsername && password === validPassword) {
        // Set a simple auth cookie (HTTP-only)
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        redirect('/sys-monitor');
    } else {
        return { error: 'Invalid Credentials' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect('/sys-monitor/login');
}

export async function getAuthStatus() {
    const cookieStore = await cookies();
    return cookieStore.has(AUTH_COOKIE_NAME);
}

import { cleanupOldLogs } from '@/lib/logger-server';
import { revalidatePath } from 'next/cache';

export async function cleanLogsAction() {
    const result = await cleanupOldLogs();
    revalidatePath('/sys-monitor');
    return result;
}

import { clearAllLogs } from '@/lib/logger-server';

export async function clearAllLogsAction() {
    const result = await clearAllLogs();
    revalidatePath('/sys-monitor');
    return result;
}
