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
        
        const EmployeeSchema = new mongoose.Schema({
            name: String,
            employeeId: String,
        });
        const ScheduleSchema = new mongoose.Schema({
            employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
            date: Date,
            startTime: String,
            endTime: String,
            status: String,
        });

        const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
        const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        console.log(`Checking schedules for ${today.toDateString()}...`);

        const schedules = await Schedule.find({})
            .populate('employeeId', 'name employeeId').lean();

        if (schedules.length === 0) {
            console.log('No published schedules for today.');
        } else {
            console.log('Today\'s scheduled shifts:');
            schedules.forEach((s: any) => {
                const emp = s.employeeId;
                console.log(`- ${emp?.name || 'Unknown'} (${emp?.employeeId || 'No ID'}): ${s.startTime} - ${s.endTime}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
