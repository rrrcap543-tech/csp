import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Schedule, Employee } from '@/lib/models/models';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { sendRosterChangeEmail } from '@/lib/mail';

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
            const oldShift = await Schedule.findById(_id).populate('employeeId');
            const updated = await Schedule.findByIdAndUpdate(_id, updateData, { new: true }).populate('employeeId');

            // If shift was already published, notify the employee of the change
            if (updated && updated.status === 'published' && updated.employeeId && updated.employeeId.email) {
                const dateStr = format(new Date(updated.date), 'EEE, dd MMM');
                const details = `Date: ${dateStr}<br>Time: ${updated.startTime} - ${updated.endTime}`;
                await sendRosterChangeEmail(updated.employeeId.email, updated.employeeId.name, details)
                    .catch(err => console.error('Failed to send change notification:', err));
            }

            return NextResponse.json(updated);
        } else {
            const newShift = new Schedule(updateData);
            await newShift.save();
            const populated = await Schedule.findById(newShift._id).populate('employeeId');

            // If new shift is created as published, notify
            if (populated && populated.status === 'published' && populated.employeeId && populated.employeeId.email) {
                const dateStr = format(new Date(populated.date), 'EEE, dd MMM');
                const details = `Date: ${dateStr}<br>Time: ${populated.startTime} - ${populated.endTime}`;
                await sendRosterChangeEmail(populated.employeeId.email, populated.employeeId.name, `New Shift Added:<br>${details}`)
                    .catch(err => console.error('Failed to send change notification:', err));
            }

            return NextResponse.json(populated);
        }
    } catch (error) {
        console.error('Save shift error:', error);
        return NextResponse.json({ error: 'Failed to save shift' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await connectDB();

        const shift = await Schedule.findById(id).populate('employeeId');

        if (shift && shift.status === 'published' && shift.employeeId && shift.employeeId.email) {
            const dateStr = format(new Date(shift.date), 'EEE, dd MMM');
            const details = `Shift for ${dateStr} (${shift.startTime} - ${shift.endTime}) has been removed.`;
            await sendRosterChangeEmail(shift.employeeId.email, shift.employeeId.name, details)
                .catch(err => console.error('Failed to send deletion notification:', err));
        }

        await Schedule.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete shift error:', error);
        return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
    }
}
