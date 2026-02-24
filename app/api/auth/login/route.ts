import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee } from '@/lib/models/models';

export async function POST(req: Request) {
    try {
        const { identifier, password, mode } = await req.json();
        await connectDB();

        let query: any = {};
        if (mode === 'kiosk') {
            // Kiosk mode now only requires an Admin PIN (identifier)
            const admin = await Employee.findOne({ employeeId: identifier, role: 'admin' });
            if (!admin) {
                return NextResponse.json({ error: 'Invalid Admin PIN' }, { status: 401 });
            }
            return NextResponse.json({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                employeeId: admin.employeeId,
                role: 'kiosk',
                success: true
            });
        }

        if (mode === 'admin') {
            query = { email: identifier, role: 'admin' };
        } else {
            query = { email: identifier, role: 'employee' };
        }

        const user = await Employee.findOne(query);

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Return user data (In a real app, generate a JWT or session here)
        return NextResponse.json({
            id: user._id,
            name: user.name,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role,
            success: true
        });
    } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
