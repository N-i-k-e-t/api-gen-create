import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON (First row as header)
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
            return NextResponse.json({ error: 'Empty or invalid excel file' }, { status: 400 });
        }

        // Save to DB
        await prisma.excelData.create({
            data: {
                date: new Date(),
                rawData: JSON.stringify(jsonData),
            },
        });

        return NextResponse.json({ success: true, count: jsonData.length });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
