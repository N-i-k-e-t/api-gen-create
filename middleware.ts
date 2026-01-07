import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Define protected routes
    const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/api/upload');

    if (isProtectedRoute) {
        const cookie = req.cookies.get('session')?.value;
        const session = await verifySession(cookie);

        if (!session) {
            if (path.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            } else {
                return NextResponse.redirect(new URL('/login', req.nextUrl));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/upload/:path*'],
};
