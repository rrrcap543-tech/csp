import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Employee } from '@/lib/models/models';

export async function GET() {
    try {
        await connectDB();

        const adminExists = await Employee.findOne({ role: 'admin' });
        if (adminExists) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        const defaultAdmin = new Employee({
            name: 'Store Manager',
            employeeId: 'ADMIN-1',
            email: 'rrrcap543@gmail.com',
            role: 'admin',
            password: 'caprinos2024'
        });

        await defaultAdmin.save();
        return NextResponse.json({
            message: 'Default admin created!',
            credentials: { email: 'rrrcap543@gmail.com', pass: 'caprinos2024' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
    }
}
