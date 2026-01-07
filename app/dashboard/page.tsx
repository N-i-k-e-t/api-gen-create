import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardUI from './DashboardUI';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const session = await verifySession(token);

    if (!session) {
        redirect('/login');
    }

    const key = await prisma.systemKey.findFirst();

    return <DashboardUI currentKeyPrefix={key?.keyPrefix} />;
}
