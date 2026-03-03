import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee, TimeLog } from '@/lib/models/models';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get('start');
        const endParam = searchParams.get('end');
        const storeIdParam = searchParams.get('storeId'); // Added storeId handling

        let dateFilter: any = {};
        if (startParam && endParam) {
            dateFilter.clockIn = { $gte: new Date(startParam), $lte: new Date(endParam) };
        } else {
            // Default to last 7 days if no date range is provided for weekly logs
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateFilter.clockIn = { $gte: sevenDaysAgo };
        }

        let commonQuery: any = {};
        if (storeIdParam) {
            commonQuery.storeId = storeIdParam;
        }

        const activeStaff = await TimeLog.countDocuments({ ...commonQuery, status: 'active' });
        const totalEmployees = await Employee.countDocuments(commonQuery); // Assuming Employee also has storeId

        // Recent activity
        const recentLogs = await TimeLog.find(commonQuery)
            .populate('employeeId', 'name employeeId')
            .sort({ clockIn: -1 })
            .limit(5);

        // Sum hours for the specified date range or last 7 days
        const weeklyLogs = await TimeLog.find({ ...commonQuery, ...dateFilter });
        const totalHours = weeklyLogs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);

        // Count all unpaid completed logs
        const pendingPayroll = await TimeLog.countDocuments({ ...commonQuery, status: 'completed', isPaid: false });

        return NextResponse.json({
            activeStaff,
            totalEmployees,
            totalHours: Math.round(totalHours),
            pendingPayroll,
            recentActivity: recentLogs.map(l => {
                const emp = l.employeeId;
                return {
                    name: emp?.name || 'Unknown Staff',
                    action: l.status === 'active' ? 'Clocked In' :
                        l.status === 'pending_approval' ? 'Requested Remote Out' :
                            l.status === 'denied' ? 'Remote Out Denied' : 'Clocked Out',
                    time: (l.status === 'pending_approval' ? l.requestedAt : (l.clockOut || l.clockIn))?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--',
                    id: emp?.employeeId || '---',
                    status: l.status
                };
            })
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
