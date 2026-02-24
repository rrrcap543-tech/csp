import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee } from '@/lib/models/models';
import { sendInviteEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        await connectDB();

        const employee = await Employee.findById(id);

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        if (employee.inviteStatus === 'accepted') {
            return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
        }

        if (!employee.email) {
            return NextResponse.json({ error: 'Employee has no email address' }, { status: 400 });
        }

        // Generate new token if missing
        if (!employee.inviteToken) {
            employee.inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await employee.save();
        }

        await sendInviteEmail(employee.email, employee.name, employee.inviteToken);

        return NextResponse.json({ success: true, message: 'Invitation resent successfully' });
    } catch (error) {
        console.error('Resend invite error:', error);
        return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
    }
}
