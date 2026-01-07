import { prisma } from '@/lib/prisma';
import { authenticateKey } from '@/lib/guard';
import { parseExcel } from '@/lib/excel';
import { createErrorResponse } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const auth = await authenticateKey(req, 'BULK');
    if (!auth.success) {
        await prisma.auditLog.create({
            data: {
                action: 'INGEST_BULK',
                status: 'DENIED',
                metadata: JSON.stringify({ reason: auth.reason }),
                ipAddress: 'Unknown'
            }
        });
        return auth.response;
    }

    const apiKey = auth.apiKey;

    let formData;
    try {
        formData = await req.formData();
    } catch (e) {
        return createErrorResponse('INVALID_BODY', 'Invalid form data');
    }

    const file = formData.get('file') as File;
    if (!file) return createErrorResponse('MISSING_FILE', 'File not found');

    const buffer = Buffer.from(await file.arrayBuffer());

    let excelData;
    try {
        excelData = parseExcel(buffer);
    } catch (e) {
        return createErrorResponse('INVALID_FILE', 'Could not parse Excel');
    }

    const { headers, data } = excelData;
    if (!headers.includes('Timestamp') || !headers.includes('Department')) {
        return createErrorResponse('INVALID_SCHEMA', 'Missing required columns: Timestamp, Department');
    }

    const metricNames = headers.filter(h => h !== 'Timestamp' && h !== 'Department');
    const metricMap = new Map();

    let processed = 0;
    let skipped = 0;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Resolve Metrics
            for (const name of metricNames) {
                let metric = await tx.metric.findUnique({ where: { name } });
                if (!metric) {
                    metric = await tx.metric.create({ data: { name, dataType: 'integer' } });
                }
                metricMap.set(name, metric.id);
            }

            // 2. Process Rows
            let rowIdx = 1;
            for (const row of data) {
                rowIdx++;
                const rawDate = row['Timestamp'];
                const deptCode = row['Department'];

                if (!rawDate || !deptCode) continue; // Skip invalid rows in bulk? Or throw? Warning.

                let reportDate: Date;
                if (rawDate instanceof Date) reportDate = rawDate;
                else reportDate = new Date(rawDate);

                if (isNaN(reportDate.getTime())) continue;

                // Normalize
                reportDate = new Date(Date.UTC(reportDate.getUTCFullYear(), reportDate.getUTCMonth(), reportDate.getUTCDate()));

                // Resolve Department
                let deptId;
                const dept = await tx.department.findFirst({
                    where: { OR: [{ code: deptCode }, { name: deptCode }] }
                });

                if (!dept) {
                    const newDept = await tx.department.create({
                        data: { name: deptCode, code: deptCode }
                    });
                    deptId = newDept.id;
                } else {
                    deptId = dept.id;
                }

                // Check Duplicate (Idempotent: Skip)
                const existing = await tx.submission.findUnique({
                    where: {
                        departmentId_reportDate: {
                            departmentId: deptId,
                            reportDate: reportDate
                        }
                    }
                });

                if (existing) {
                    skipped++;
                    continue;
                }

                // Create Submission
                const submission = await tx.submission.create({
                    data: {
                        departmentId: deptId,
                        reportDate: reportDate,
                        apiKeyId: apiKey.id,
                    }
                });

                // Create Values
                for (const mName of metricNames) {
                    const val = row[mName];
                    if (val !== undefined && val !== null) {
                        const numVal = Number(val);
                        if (!isNaN(numVal) && numVal >= 0) {
                            await tx.metricValue.create({
                                data: {
                                    submissionId: submission.id,
                                    metricId: metricMap.get(mName),
                                    value: numVal
                                }
                            });
                        }
                    }
                }
                processed++;
            }
        });

        // Audit Success
        await prisma.auditLog.create({
            data: {
                actorKeyId: apiKey.id,
                action: 'INGEST_BULK',
                status: 'SUCCESS',
                metadata: JSON.stringify({ processed, skipped })
            }
        });

        return NextResponse.json({ success: true, processed, skipped });

    } catch (e: any) {
        await prisma.auditLog.create({
            data: {
                actorKeyId: apiKey.id,
                action: 'INGEST_BULK',
                status: 'FAILURE',
                metadata: JSON.stringify({ error: e.message })
            }
        });
        return createErrorResponse('INGEST_FAILED', e.message);
    }
}
