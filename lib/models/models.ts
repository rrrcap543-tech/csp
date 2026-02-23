import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, sparse: true, unique: true },
    email: { type: String, sparse: true, unique: true },
    role: { type: String, enum: ['employee', 'admin', 'kiosk'], default: 'employee' },
    password: { type: String }, // Optional until invite accepted
    inviteToken: { type: String, sparse: true, unique: true },
    inviteStatus: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    storeId: { type: String, default: 'northampton-uk' },
    createdAt: { type: Date, default: Date.now },
});

export const Employee = models.Employee || model('Employee', EmployeeSchema);

const TimeLogSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    locationIn: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
        address: String
    },
    locationOut: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
        address: String
    },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    isPaid: { type: Boolean, default: false },
    remarks: { type: String },
    hoursWorked: { type: Number, default: 0 },
});

// Calculate hours worked before saving if clockOut is present
TimeLogSchema.pre('save', function () {
    if (this.clockIn && this.clockOut) {
        const diff = (this.clockOut.getTime() - this.clockIn.getTime()) / (1000 * 60 * 60);
        this.hoursWorked = Math.round(diff * 100) / 100;
    }
});

export const TimeLog = models.TimeLog || model('TimeLog', TimeLogSchema);

const ScheduleSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format HH:mm
    endTime: { type: String, required: true },   // Format HH:mm
    role: { type: String }, // Optional: specific role for this shift (e.g. "Driver")
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    storeId: { type: String, default: 'northampton-uk' },
    createdAt: { type: Date, default: Date.now },
});

export const Schedule = models.Schedule || model('Schedule', ScheduleSchema);
