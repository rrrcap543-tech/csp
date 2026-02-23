import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Schedule, Employee } from '@/lib/models/models';
import { startOfWeek, endOfWeek, addDays, subWeeks } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('weekStart');
        const storeId = searchParams.get('storeId') || 'northampton-uk';

        await connectDB();

        const weekStart = dateStr ? new Date(dateStr) : startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

        const shifts = await Schedule.find({
            storeId,
            date: { $gte: weekStart, $lte: weekEnd }
        }).populate('employeeId', 'name employeeId role');

        return NextResponse.json(shifts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await connectDB();

        const { _id, ...updateData } = body;

        if (_id) {
            const updated = await Schedule.findByIdAndUpdate(_id, updateData, { new: true });
            return NextResponse.json(updated);
        } else {
            const newShift = new Schedule(updateData);
            await newShift.save();
            return NextResponse.json(newShift);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save shift' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await connectDB();
        await Schedule.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
    }
}
