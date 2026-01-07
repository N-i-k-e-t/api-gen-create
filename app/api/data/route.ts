import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    let authorized = false;

    // 1. Check Session (Admin)
    const cookie = req.cookies.get('session')?.value;
    if (cookie) {
        const session = await verifySession(cookie);
        if (session) authorized = true;
    }

    // 2. Check API Key (Public)
    if (!authorized) {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ status: 'error', message: 'Missing API Key' }, { status: 401 });
        }

        const apiKey = authHeader.split(' ')[1];
        const hashedKey = await hashPassword(apiKey);

        const keyRecord = await prisma.systemKey.findFirst({
            where: { keyHash: hashedKey }
        });

        if (!keyRecord) {
            return NextResponse.json({ status: 'error', message: 'Invalid API Key' }, { status: 403 });
        }
        authorized = true;
    }

    // Fetch all data
    const allUploads = await prisma.excelData.findMany({
        orderBy: { date: 'desc' }
    });

    if (allUploads.length === 0) {
        return NextResponse.json({
            status: 'success',
            updated_at: null,
            data: []
        });
    }

    const latestDate = allUploads[0].date;

    // Flatten and Format
    const flatData = allUploads.flatMap(upload => {
        // Legacy support or check if rawData is string
        let rows: any[] = [];
        try {
            rows = JSON.parse(upload.rawData);
        } catch (e) { rows = [] }

        const uploadDateStr = upload.date.toISOString().split('T')[0]; // YYYY-MM-DD

        return rows.map((row: any) => ({
            date: uploadDateStr,
            values: row
        }));
    });

    return NextResponse.json({
        status: 'success',
        updated_at: latestDate,
        data: flatData
    });
}
