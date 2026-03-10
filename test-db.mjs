import mongoose from 'mongoose';
import fs from 'fs';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);

    const TimeLog = mongoose.models.TimeLog || mongoose.model('TimeLog', new mongoose.Schema({}, { strict: false }));

    const logs = await TimeLog.find().sort({ clockIn: -1 }).limit(20).lean();

    fs.writeFileSync('db_output.json', JSON.stringify(logs, null, 2));
    process.exit(0);
}

check();
