import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TimeLog, Employee } from '@/lib/models/models';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employeeId');
        const email = searchParams.get('email');
        const week = searchParams.get('week');

        await connectDB();

        let query: any = {};
        if (employeeId) {
            query.employeeId = employeeId;
        } else if (email) {
            const emp = await Employee.findOne({ email });
            if (emp) query.employeeId = emp._id;
            else return NextResponse.json([]);
        }

        // In a real app, you'd filter by date range for the week
        const logs = await TimeLog.find(query)
            .populate('employeeId', 'name employeeId')
            .sort({ clockIn: -1 });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, isPaid, remarks } = await req.json();
        await connectDB();

        const updated = await TimeLog.findByIdAndUpdate(
            id,
            { isPaid, remarks },
            { new: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update log' }, { status: 500 });
    }
}
