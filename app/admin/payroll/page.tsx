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
            const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
            const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
            const res = await fetch(`/api/logs?status=completed&start=${start.toISOString()}&end=${end.toISOString()}`);
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
                    <button className="icon-btn" onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() - 7)))}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="week-range">
                        <Calendar size={18} />
                        <span>{format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}</span>
                    </div>
                    <button className="icon-btn" onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() + 7)))}>
                        <ChevronRight size={20} />
                    </button>
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
                                <td data-label="Employee">
                                    <div className="emp-info">
                                        <div className="image-placeholder">{log.employeeId?.name?.[0] || '?'}</div>
                                        <div className="emp-text">
                                            <span className="name">{log.employeeId?.name || 'Deleted Employee'}</span>
                                            <span className="id">ID: {log.employeeId?.employeeId || '??'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Date">{format(new Date(log.clockIn), 'EEE, MMM d')}</td>
                                <td data-label="Clock In/Out">
                                    <div className="time-info">
                                        {format(new Date(log.clockIn), 'HH:mm')} - {log.clockOut ? format(new Date(log.clockOut), 'HH:mm') : 'Active'}
                                    </div>
                                </td>
                                <td data-label="Hours">
                                    <span className="hours-badge">
                                        {log.hoursWorked || '---'} hrs
                                    </span>
                                </td>
                                <td data-label="Status">
                                    {log.isPaid ? (
                                        <span className="status-paid"><CheckCircle2 size={14} /> Paid</span>
                                    ) : (
                                        <span className="status-pending"><XCircle size={14} /> Pending</span>
                                    )}
                                </td>
                                <td data-label="Remarks">
                                    <div className="remarks-box" onClick={() => handleRemarks(log._id, log.remarks)}>
                                        {log.remarks || <span className="placeholder">Add remarks...</span>}
                                    </div>
                                </td>
                                <td data-label="Actions">
                                    <button
                                        className={`pay-btn ${log.isPaid ? 'paid' : ''}`}
                                        onClick={() => togglePaid(log._id, log.isPaid)}
                                    >
                                        <Banknote size={18} />
                                        <span>{log.isPaid ? 'Unmark' : 'Mark Paid'}</span>
                                    </button>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; gap: 1.5rem; flex-wrap: wrap; }
        .page-header h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.5px; }
        .week-selector { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 1.25rem; background: white; border: 1px solid var(--border); }
        .week-range { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; padding: 0 1rem; border-left: 1px solid var(--border); border-right: 1px solid var(--border); font-size: 0.95rem; }

        .image-placeholder { width: 40px; height: 40px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .emp-info { display: flex; align-items: center; gap: 0.75rem; }
        .emp-text { display: flex; flex-direction: column; }
        .emp-text .name { font-weight: 700; color: var(--foreground); }
        .emp-text .id { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

        .hours-badge { 
          background: #f1f5f9; color: #475569; 
          padding: 0.4rem 0.75rem; border-radius: 10px; font-weight: 800; font-variant-numeric: tabular-nums;
          border: 1px solid rgba(0,0,0,0.05); font-size: 0.9rem;
        }

        .status-paid { background: #dcfce7; color: #166534; padding: 0.35rem 0.75rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.8rem; }
        .status-pending { background: #f1f5f9; color: #64748b; padding: 0.35rem 0.75rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.8rem; }

        .remarks-box { 
          max-width: 220px; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;
          cursor: pointer; padding: 0.6rem; border-radius: 0.75rem; transition: 0.2s;
          border: 1px dashed transparent;
        }
        .remarks-box:hover { background: #f8fafc; border-color: var(--border); color: var(--foreground); }
        .remarks-box .placeholder { font-style: italic; opacity: 0.5; }

        .pay-btn { 
          display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; 
          border-radius: 0.85rem; font-size: 0.85rem; font-weight: 800;
          background: var(--primary); color: white; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(212, 18, 23, 0.1);
        }
        .pay-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(212, 18, 23, 0.2); }
        .pay-btn.paid { background: #fee2e2; color: #991b1b; box-shadow: none; }
        .pay-btn.paid:hover { background: #fecaca; }

        .table-container { 
            border-radius: 2rem; 
            background: white; 
            border: 1px solid var(--border);
            overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #f8fafc; }
        th { text-align: left; padding: 1.25rem 1.5rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid var(--border); }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fdfdfd; }

        @media (max-width: 1024px) {
          .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          th, td { white-space: nowrap; padding: 1rem; }
        }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: stretch; gap: 1rem; }
          .week-selector { width: 100%; justify-content: space-between; order: 2; }
          .title-area { order: 1; }
          .title-area h1 { font-size: 1.75rem; }
          
          .table-container { background: transparent; border: none; overflow: visible; }
          table thead { display: none; }
          table, tbody, tr, td { display: block; width: 100%; }
          
          tr { 
            background: white; 
            margin-bottom: 1rem; 
            padding: 1.25rem; 
            border-radius: 1.5rem; 
            border: 1px solid var(--border);
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          }
          
          td { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 0.75rem 0; 
            border-bottom: 1px solid #f1f5f9;
            white-space: normal;
          }
          td:last-child { border-bottom: none; padding-bottom: 0; margin-top: 0.5rem; }
          
          td::before {
            content: attr(data-label);
            font-weight: 800;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--text-muted);
          }
          
          .pay-btn { width: 100%; justify-content: center; padding: 0.85rem; }
          .remarks-box { max-width: none; width: 100%; background: #f8fafc; margin-left: 1rem; }
          .hours-badge { font-size: 1rem; padding: 0.5rem 1rem; }
        }

      `}</style>
        </div>
    );
}
