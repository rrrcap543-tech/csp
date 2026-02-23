import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Schedule } from '@/lib/models/models';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { weekStart, storeId } = await req.json();
        await connectDB();

        const start = new Date(weekStart);
        const end = endOfWeek(start, { weekStartsOn: 1 });

        await Schedule.updateMany(
            {
                storeId: storeId || 'northampton-uk',
                date: { $gte: start, $lte: end },
                status: 'draft'
            },
            { $set: { status: 'published' } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to publish rota' }, { status: 500 });
    }
}
