import { NextRequest, NextResponse } from 'next/server';
import { verifyLogin, signSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        const isValid = await verifyLogin(password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create session
        const token = await signSession({ role: 'admin' });
        const cookieStore = await cookies();

        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
