'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, MessageSquare, ChevronLeft, ChevronRight, Banknote } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export default function PayrollPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState(new Date());

    useEffect(() => {
        fetchLogs();
    }, [selectedWeek]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/logs');
            const data = await res.json();
            if (Array.isArray(data)) setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const togglePaid = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/logs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isPaid: !currentStatus })
            });
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemarks = async (id: string, currentRemarks: string) => {
        const text = prompt('Enter remarks for this entry:', currentRemarks || '');
        if (text === null) return;
        try {
            await fetch('/api/logs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, remarks: text })
            });
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="payroll-page">
            <header className="page-header">
                <div className="title-area">
                    <h1>Payroll & Timesheets</h1>
                    <p>Review hours and mark as paid for Northampton staff</p>
                </div>
                <div className="week-selector glass">
                    <button className="icon-btn"><ChevronLeft size={20} /></button>
                    <div className="week-range">
                        <Calendar size={18} />
                        <span>{format(startOfWeek(selectedWeek), 'MMM d')} - {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}</span>
                    </div>
                    <button className="icon-btn"><ChevronRight size={20} /></button>
                </div>
            </header>

            <div className="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Clock In/Out</th>
                            <th>Total Hours</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No time logs found for this period.</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log._id}>
                                <td>
                                    <div className="emp-info">
                                        <span className="name">{log.employeeId?.name}</span>
                                        <span className="id">ID: {log.employeeId?.employeeId}</span>
                                    </div>
                                </td>
                                <td>{format(new Date(log.clockIn), 'EEE, MMM d')}</td>
                                <td>
                                    <div className="time-info">
                                        {format(new Date(log.clockIn), 'HH:mm')} - {log.clockOut ? format(new Date(log.clockOut), 'HH:mm') : 'Active'}
                                    </div>
                                </td>
                                <td>
                                    <span className="hours-badge">
                                        {log.hoursWorked || '---'} hrs
                                    </span>
                                </td>
                                <td>
                                    {log.isPaid ? (
                                        <span className="status-paid"><CheckCircle2 size={16} /> Paid</span>
                                    ) : (
                                        <span className="status-pending"><XCircle size={16} /> Pending</span>
                                    )}
                                </td>
                                <td>
                                    <div className="remarks-box" onClick={() => handleRemarks(log._id, log.remarks)}>
                                        {log.remarks || <span className="placeholder">Add remarks...</span>}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className={`pay-btn ${log.isPaid ? 'paid' : ''}`}
                                        onClick={() => togglePaid(log._id, log.isPaid)}
                                    >
                                        <Banknote size={18} />
                                        {log.isPaid ? 'Unmark' : 'Mark Paid'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .week-selector { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; border-radius: 1rem; }
        .week-range { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; padding: 0 1rem; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }

        .emp-info { display: flex; flex-direction: column; }
        .emp-info .name { font-weight: 600; }
        .emp-info .id { font-size: 0.75rem; color: var(--text-muted); }

        .hours-badge { 
          background: rgba(253, 184, 19, 0.1); color: var(--secondary); 
          padding: 0.25rem 0.75rem; border-radius: 8px; font-weight: 700; font-variant-numeric: tabular-nums;
        }

        .status-paid { color: #22c55e; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; }
        .status-pending { color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; }

        .remarks-box { 
          max-width: 200px; font-size: 0.85rem; color: var(--text-muted); 
          cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: 0.2s;
        }
        .remarks-box:hover { background: rgba(15, 23, 42, 0.05); color: var(--foreground); }
        .remarks-box .placeholder { font-style: italic; opacity: 0.5; }

        .pay-btn { 
          display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; 
          border-radius: 0.75rem; font-size: 0.85rem; font-weight: 600;
          background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .pay-btn:hover { background: rgba(34, 197, 94, 0.2); }
        .pay-btn.paid { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
        .pay-btn.paid:hover { background: rgba(239, 68, 68, 0.2); }

        .table-container { border-radius: 1.5rem; overflow: hidden; margin-top: 1rem; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1.25rem 1.5rem; color: var(--text-muted); font-size: 0.85rem; border-bottom: 1px solid var(--border); }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }

        @media (max-width: 1024px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .week-selector {
            width: 100%;
            justify-content: space-between;
          }
          .table-container {
            overflow-x: auto;
            margin: 0 -1rem;
            border-radius: 0;
          }
          th, td {
            white-space: nowrap;
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
}
