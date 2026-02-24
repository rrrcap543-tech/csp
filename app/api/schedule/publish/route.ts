import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Schedule, Employee } from '@/lib/models/models';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { sendRosterPublishedEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { weekStart, storeId } = await req.json();
        await connectDB();

        const start = new Date(weekStart);
        const end = endOfWeek(start, { weekStartsOn: 1 });

        // Update all draft schedules to published for the week
        await Schedule.updateMany(
            {
                storeId: storeId || 'northampton-uk',
                date: { $gte: start, $lte: end },
                status: 'draft'
            },
            { $set: { status: 'published' } }
        );

        // Find all employees who have shifts in this published week
        const shifts = await Schedule.find({
            storeId: storeId || 'northampton-uk',
            date: { $gte: start, $lte: end },
            status: 'published'
        }).distinct('employeeId');

        const employees = await Employee.find({ _id: { $in: shifts }, email: { $exists: true } });

        const weekStr = format(start, 'dd MMM yyyy');

        // Send emails in background
        Promise.all(employees.map(emp =>
            sendRosterPublishedEmail(emp.email, emp.name, weekStr)
                .catch(err => console.error(`Failed to send roster email to ${emp.email}:`, err))
        ));

        return NextResponse.json({ success: true, notifiedCount: employees.length });
    } catch (error) {
        console.error('Publish roster error:', error);
        return NextResponse.json({ error: 'Failed to publish rota' }, { status: 500 });
    }
}
