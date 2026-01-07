import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifySession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    const session = await verifySession(cookie);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newKey = 'sk_' + uuidv4().replace(/-/g, '');
    const hashed = await hashPassword(newKey);
    const prefix = newKey.substring(0, 10) + '...';

    // Transaction: Clear old, set new
    await prisma.$transaction([
        prisma.systemKey.deleteMany(),
        prisma.systemKey.create({
            data: {
                keyHash: hashed,
                keyPrefix: prefix
            }
        })
    ]);

    return NextResponse.json({ success: true, newKey });
}
