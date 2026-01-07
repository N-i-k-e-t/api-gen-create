'use server';

import { signSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // HARDCODED CREDENTIALS AS REQUESTED
    if (username === 'niket24' && password === '123456') {
        const token = await signSession({ user: 'niket24', role: 'admin' });
        const cookieStore = await cookies();
        cookieStore.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        return { success: true };
    }

    return { success: false, message: 'Invalid credentials' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
}
