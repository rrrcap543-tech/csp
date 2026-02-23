import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Schedule } from '@/lib/models/models';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { sourceWeekStart, targetWeekStart, storeId } = await req.json();
        await connectDB();

        const srcStart = new Date(sourceWeekStart);
        const srcEnd = endOfWeek(srcStart, { weekStartsOn: 1 });

        const targetStart = new Date(targetWeekStart);

        // Fetch all shifts from source week
        const sourceShifts = await Schedule.find({
            storeId: storeId || 'northampton-uk',
            date: { $gte: srcStart, $lte: srcEnd }
        });

        if (sourceShifts.length === 0) {
            return NextResponse.json({ error: 'No shifts found in source week to copy' }, { status: 400 });
        }

        // Calculate offset (7 days for 1 week)
        const copiedShifts = sourceShifts.map(shift => {
            const shiftDate = new Date(shift.date);
            const offsetDays = Math.round((shiftDate.getTime() - srcStart.getTime()) / (1000 * 60 * 60 * 24));

            const newDate = new Date(targetStart);
            newDate.setDate(targetStart.getDate() + offsetDays);

            return {
                employeeId: shift.employeeId,
                date: newDate,
                startTime: shift.startTime,
                endTime: shift.endTime,
                role: shift.role,
                status: 'draft', // Always copy as draft
                storeId: shift.storeId
            };
        });

        await Schedule.insertMany(copiedShifts);

        return NextResponse.json({ success: true, count: copiedShifts.length });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to copy schedule' }, { status: 500 });
    }
}
