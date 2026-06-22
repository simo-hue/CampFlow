'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, MAIN_AUTH_COOKIE } from '@/lib/auth';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
        const token = await createSessionToken(SESSION_MAX_AGE);
        cookieStore.set(MAIN_AUTH_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_MAX_AGE,
        });

        redirect('/');
    } else {
        return { error: 'Invalid Credentials' };
    }
}
