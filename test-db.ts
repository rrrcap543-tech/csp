import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const TimeLog = mongoose.model('TimeLog', new mongoose.Schema({}, { strict: false }));
    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    const logs = await TimeLog.find({ status: 'active' }).lean();
    console.log('Active logs:', logs);

    const emps = await Employee.find().lean();
    console.log('Employees:', emps);

    process.exit(0);
}

check();
