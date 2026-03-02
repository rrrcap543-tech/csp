import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee } from '@/lib/models/models';
import { sendInviteEmail } from '@/lib/mail';

export async function GET() {
    try {
        await connectDB();
        const employees = await Employee.find({}).sort({ name: 1 });
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Sanitize unique sparse fields - convert empty strings to undefined
        if (body.username === '') delete body.username;
        if (body.email === '') delete body.email;

        await connectDB();

        const query: any = { $or: [{ employeeId: body.employeeId }] };
        if (body.email) query.$or.push({ email: body.email });
        if (body.username) query.$or.push({ username: body.username });

        const existing = await Employee.findOne(query);

        if (existing) {
            return NextResponse.json({ error: 'ID, Email or Username already exists' }, { status: 400 });
        }

        const isKiosk = body.role === 'kiosk';
        const inviteToken = isKiosk ? undefined : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const newEmployee = new Employee({
            ...body,
            inviteToken,
            inviteStatus: isKiosk ? 'accepted' : 'pending',
            password: isKiosk ? body.password : undefined // Password set by user during invite accept
        });

        await newEmployee.save();

        if (!isKiosk && newEmployee.email && inviteToken) {
            await sendInviteEmail(newEmployee.email, newEmployee.name, inviteToken);
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const responseData = {
            ...newEmployee.toObject(),
            inviteUrl: isKiosk ? null : `${baseUrl}/accept-invite/${inviteToken}`
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Create employee error:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, ...data } = await req.json();

        // Sanitize unique sparse fields - convert empty strings to undefined
        if (data.username === '') data.username = undefined;
        if (data.email === '') data.email = undefined;

        await connectDB();
        const updated = await Employee.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update employee error:', error);
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await connectDB();
        await Employee.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
