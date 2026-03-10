import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

async function check() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/MONGODB_URI=(.*)/);
        const MONGODB_URI = match ? match[1].trim() : null;

        if (!MONGODB_URI) {
            console.error('MONGODB_URI not found in .env.local');
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        const TimeLogSchema = new mongoose.Schema({
            employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
            status: String,
            clockIn: Date,
        });
        const EmployeeSchema = new mongoose.Schema({
            name: String,
            employeeId: String,
        });

        const TimeLog = mongoose.models.TimeLog || mongoose.model('TimeLog', TimeLogSchema);
        const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

        const activeLogs = await TimeLog.find({ status: 'active' })
            .populate('employeeId', 'name employeeId')
            .lean();

        if (activeLogs.length === 0) {
            console.log('No employees are currently on shift.');
        } else {
            console.log('Employees currently on shift:');
            activeLogs.forEach((log: any) => {
                const emp = log.employeeId;
                console.log(`- ${emp?.name || 'Unknown'} (${emp?.employeeId || 'No ID'}) - Clocked in at ${new Date(log.clockIn).toLocaleString()}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
