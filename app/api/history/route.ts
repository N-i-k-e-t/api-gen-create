import { prisma } from '@/lib/prisma';
import { authenticateKey } from '@/lib/guard';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const auth = await authenticateKey(req);
    if (!auth.success) return auth.response;

    // Only show ingest events
    const logs = await prisma.auditLog.findMany({
        where: { action: { in: ['INGEST_DAILY', 'INGEST_BULK'] } },
        orderBy: { timestamp: 'desc' },
        take: 50
    });

    return NextResponse.json({ history: logs });
}
