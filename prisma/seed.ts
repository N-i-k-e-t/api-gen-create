import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    // Create Department
    const dept = await prisma.department.upsert({
        where: { code: 'ENG' },
        update: {},
        create: {
            name: 'Engineering',
            code: 'ENG',
        },
    });
    console.log('Department Engineering created/found.');

    // Create Keys
    const keys = [
        { type: 'DAILY', key: 'sk_live_daily_12345' },
        { type: 'BULK', key: 'sk_live_bulk_99999' },
        { type: 'READ_ONLY', key: 'sk_read_only_88888' },
    ];

    for (const k of keys) {
        const hash = createHash('sha256').update(k.key).digest('hex');
        await prisma.apiKey.upsert({
            where: { keyHash: hash },
            update: {},
            create: {
                keyPrefix: k.key.substring(0, 10),
                keyHash: hash,
                type: k.type,
                ownerName: 'Seed Script',
            },
        });
        console.log(`Created ${k.type} Key: ${k.key}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
