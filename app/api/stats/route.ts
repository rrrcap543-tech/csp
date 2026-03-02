import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee, TimeLog } from '@/lib/models/models';

export async function GET() {
    try {
        await connectDB();

        const activeStaff = await TimeLog.countDocuments({ status: 'active' });
        const totalEmployees = await Employee.countDocuments({});

        // Recent activity
        const recentLogs = await TimeLog.find({})
            .populate('employeeId', 'name employeeId')
            .sort({ clockIn: -1 })
            .limit(5);

        // Sum hours for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyLogs = await TimeLog.find({ clockIn: { $gte: sevenDaysAgo } });
        const totalHours = weeklyLogs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);

        // Count all unpaid completed logs
        const pendingPayroll = await TimeLog.countDocuments({ status: 'completed', isPaid: false });

        return NextResponse.json({
            activeStaff,
            totalEmployees,
            totalHours: Math.round(totalHours),
            pendingPayroll,
            recentActivity: recentLogs.map(l => ({
                name: l.employeeId?.name || 'Unknown',
                action: l.status === 'active' ? 'Clocked In' :
                    l.status === 'pending_approval' ? 'Requested Remote Out' :
                        l.status === 'denied' ? 'Remote Out Denied' : 'Clocked Out',
                time: (l.status === 'pending_approval' ? l.requestedAt : (l.clockOut || l.clockIn)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: l.employeeId?.employeeId || '---',
                status: l.status
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
