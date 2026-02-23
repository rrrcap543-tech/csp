import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee, TimeLog } from '@/lib/models/models';

export async function POST(req: Request) {
    try {
        const { employeeId, email, action, location } = await req.json();

        if ((!employeeId && !email) || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        const employee = employeeId
            ? await Employee.findOne({ employeeId })
            : await Employee.findOne({ email });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        if (action === 'in') {
            // Check if already clocked in
            const existingLog = await TimeLog.findOne({
                employeeId: employee._id,
                status: 'active'
            });

            if (existingLog) {
                return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
            }

            const newLog = new TimeLog({
                employeeId: employee._id,
                clockIn: new Date(),
                locationIn: location || { address: 'STORE_KIOSK' },
                status: 'active'
            });

            await newLog.save();
            return NextResponse.json({ message: `Welcome ${employee.name}`, name: employee.name });

        } else if (action === 'out') {
            const activeLog = await TimeLog.findOne({
                employeeId: employee._id,
                status: 'active'
            });

            if (!activeLog) {
                return NextResponse.json({ error: 'Not clocked in' }, { status: 400 });
            }

            activeLog.clockOut = new Date();
            activeLog.locationOut = location || { address: 'STORE_KIOSK' };
            activeLog.status = 'completed';

            await activeLog.save();
            return NextResponse.json({ message: `Goodbye ${employee.name}`, name: employee.name });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Clock API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
