import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee } from '@/lib/models/models';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        await connectDB();
        const employee = await Employee.findOne({ inviteToken: token, inviteStatus: 'pending' });

        if (!employee) {
            return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 404 });
        }

        return NextResponse.json({ name: employee.name, email: employee.email });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        await connectDB();
        const employee = await Employee.findOne({ inviteToken: token, inviteStatus: 'pending' });

        if (!employee) {
            return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 404 });
        }

        employee.password = password;
        employee.inviteStatus = 'accepted';
        employee.inviteToken = undefined; // Clear the token

        await employee.save();

        return NextResponse.json({ success: true, message: 'Account activated successfully!' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to activate account' }, { status: 500 });
    }
}
