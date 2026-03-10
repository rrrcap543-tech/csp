import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TimeLog } from '@/lib/models/models';

export async function GET(req: Request) {
    try {
        await connectDB();
        const requests = await TimeLog.find({ status: 'pending_approval' })
            .populate('employeeId', 'name employeeId')
            .sort({ requestedAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { id, action, adminId, comment } = await req.json();
        await connectDB();

        const log = await TimeLog.findById(id);
        if (!log) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }

        if (action === 'approve') {
            log.status = 'completed';
            log.clockOut = log.requestedAt || new Date(); // Use actual request time
            log.locationOut = log.remoteLocation;
            if (adminId) log.approvedBy = adminId;
            log.approvedAt = new Date();
            if (comment) log.adminComment = comment;
            await log.save();
            return NextResponse.json({ message: 'Request approved' });
        } else if (action === 'deny') {
            log.status = 'denied';
            if (adminId) log.approvedBy = adminId;
            log.approvedAt = new Date();
            if (comment) log.adminComment = comment;
            await log.save();
            return NextResponse.json({ message: 'Request denied' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Request approval error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
