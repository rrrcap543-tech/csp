'use client';

import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Copy, Send, Plus,
    Clock, User, Shield, Trash2, Calendar as CalIcon,
    AlertCircle, CheckCircle2
} from 'lucide-react';
import {
    format, startOfWeek, endOfWeek, addDays,
    subWeeks, addWeeks, isSameDay, parseISO
} from 'date-fns';

export default function AdminSchedule() {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [employees, setEmployees] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedShift, setSelectedShift] = useState<any>(null);
    const [modalData, setModalData] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '17:00',
        role: ''
    });

    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    useEffect(() => {
        fetchData();
    }, [weekStart]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, shiftRes] = await Promise.all([
                fetch('/api/employees'),
                fetch(`/api/schedule?weekStart=${weekStart.toISOString()}`)
            ]);
            const empData = await empRes.json();
            const shiftData = await shiftRes.json();

            // Only show staff and admins, exclude kiosks from main schedule
            setEmployees(empData.filter((e: any) => e.role !== 'kiosk'));
            setShifts(shiftData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveShift = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedShift ? { ...modalData, _id: selectedShift._id } : modalData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            alert('Failed to save shift');
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (!confirm('Remove this shift?')) return;
        try {
            await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleCopyWeek = async () => {
        const prevWeek = subWeeks(weekStart, 1);
        if (!confirm(`Copy all shifts from week of ${format(prevWeek, 'MMM d')} to this week?`)) return;

        try {
            const res = await fetch('/api/schedule/copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceWeekStart: prevWeek.toISOString(),
                    targetWeekStart: weekStart.toISOString()
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Successfully copied ${data.count} shifts!`);
                fetchData();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Copy failed');
        }
    };

    const handlePublish = async () => {
        if (!confirm('Publish all draft shifts for this week? Staff will be able to see them.')) return;
        try {
            const res = await fetch('/api/schedule/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weekStart: weekStart.toISOString() })
            });
            if (res.ok) {
                alert('Rota published successfully!');
                fetchData();
            }
        } catch (err) {
            alert('Publish failed');
        }
    };

    const openAddModal = (empId: string, date: Date) => {
        setSelectedShift(null);
        setModalData({
            employeeId: empId,
            date: format(date, 'yyyy-MM-dd'),
            startTime: '10:00',
            endTime: '18:00',
            role: employees.find(e => e._id === empId)?.role || ''
        });
        setShowModal(true);
    };

    const openEditModal = (shift: any) => {
        setSelectedShift(shift);
        setModalData({
            employeeId: shift.employeeId._id,
            date: format(new Date(shift.date), 'yyyy-MM-dd'),
            startTime: shift.startTime,
            endTime: shift.endTime,
            role: shift.role
        });
        setShowModal(true);
    };

    return (
        <div className="schedule-page">
            <header className="page-header">
                <div className="title-area">
                    <h1>Staff Rota</h1>
                    <p>Plan and manage weekly work schedules</p>
                </div>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={handleCopyWeek}>
                        <Copy size={18} />
                        <span>Copy Last Week</span>
                    </button>
                    <button className="primary-btn" onClick={handlePublish}>
                        <Send size={18} />
                        <span>Publish Rota</span>
                    </button>
                </div>
            </header>

            <div className="calendar-controls glass">
                <div className="week-nav">
                    <button className="icon-btn" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="current-week">
                        <CalIcon size={20} className="icon-red" />
                        <span>Week of {format(weekStart, 'MMMM d, yyyy')}</span>
                    </div>
                    <button className="icon-btn" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="legend">
                    <span className="legend-item"><div className="dot draft"></div> Draft</span>
                    <span className="legend-item"><div className="dot published"></div> Published</span>
                </div>
            </div>

            <div className="schedule-container glass">
                <div className="schedule-grid">
                    {/* Header Row */}
                    <div className="grid-corner">Employee</div>
                    {days.map(day => (
                        <div key={day.toISOString()} className={`grid-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                            <span className="day-name">{format(day, 'EEE')}</span>
                            <span className="day-date">{format(day, 'MMM d')}</span>
                        </div>
                    ))}

                    {/* Employee Rows */}
                    {employees.map(emp => (
                        <React.Fragment key={emp._id}>
                            <div className="emp-sidebar">
                                <div className="avatar-small">{emp.name[0]}</div>
                                <div className="emp-name-stack">
                                    <span className="name">{emp.name}</span>
                                    <span className="role">{emp.role}</span>
                                </div>
                            </div>
                            {days.map(day => {
                                const dayShifts = shifts.filter(s =>
                                    s.employeeId._id === emp._id &&
                                    isSameDay(new Date(s.date), day)
                                );

                                return (
                                    <div key={day.toISOString()} className="grid-cell">
                                        {dayShifts.map(shift => (
                                            <div
                                                key={shift._id}
                                                className={`shift-card ${shift.status}`}
                                                onClick={() => openEditModal(shift)}
                                            >
                                                <div className="shift-time">{shift.startTime} - {shift.endTime}</div>
                                                <div className="shift-role">{shift.role}</div>
                                            </div>
                                        ))}
                                        <button
                                            className="add-shift-btn"
                                            onClick={() => openAddModal(emp._id, day)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h2>{selectedShift ? 'Edit Shift' : 'Add Shift'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleSaveShift}>
                            <div className="form-group">
                                <label>Employee</label>
                                <select
                                    value={modalData.employeeId}
                                    onChange={e => setModalData({ ...modalData, employeeId: e.target.value })}
                                    disabled={!!selectedShift}
                                >
                                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={modalData.date}
                                    onChange={e => setModalData({ ...modalData, date: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={modalData.startTime}
                                        onChange={e => setModalData({ ...modalData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input
                                        type="time"
                                        value={modalData.endTime}
                                        onChange={e => setModalData({ ...modalData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Shift Role / Notes</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kitchen, Driver, Front"
                                    value={modalData.role}
                                    onChange={e => setModalData({ ...modalData, role: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                {selectedShift && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteShift(selectedShift._id)}
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                )}
                                <div className="flex-spacer"></div>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Save Shift</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .schedule-page { padding: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2.25rem; font-weight: 800; }
        .page-header p { color: var(--text-muted); }
        .header-actions { display: flex; gap: 1rem; }

        .primary-btn, .secondary-btn, .cancel-btn, .delete-btn {
            display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: 700; font-size: 0.9rem;
        }
        .primary-btn { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(212, 18, 23, 0.15); }
        .secondary-btn { background: white; border: 1px solid var(--border); color: var(--foreground); }
        .cancel-btn { color: var(--text-muted); }
        .delete-btn { color: var(--destructive); background: #fef2f2; }
        .flex-spacer { flex: 1; }

        .calendar-controls { padding: 1.25rem 2rem; border-radius: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .week-nav { display: flex; align-items: center; gap: 1.5rem; }
        .current-week { display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; font-weight: 800; color: var(--foreground); }
        .icon-red { color: var(--primary); }
        .legend { display: flex; gap: 1.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
        .legend-item { display: flex; align-items: center; gap: 0.5rem; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.draft { background: #94a3b8; }
        .dot.published { background: #16a34a; }

        .schedule-container { border-radius: 2rem; overflow: hidden; background: white; }
        .schedule-grid {
            display: grid;
            grid-template-columns: 240px repeat(7, 1fr);
            border-bottom: 1px solid var(--border);
        }

        .grid-corner { padding: 1.5rem; background: #f8fafc; font-weight: 800; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); color: var(--text-muted); }
        .grid-header { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: #f8fafc; }
        .grid-header.today { background: #fef2f2; color: var(--primary); }
        .day-name { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        .day-date { font-size: 1.1rem; font-weight: 800; }

        .emp-sidebar { padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .avatar-small { width: 32px; height: 32px; border-radius: 10px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
        .emp-name-stack { display: flex; flex-direction: column; }
        .emp-name-stack .name { font-weight: 700; font-size: 0.95rem; }
        .emp-name-stack .role { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: capitalize; }

        .grid-cell { padding: 0.5rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); min-height: 100px; display: flex; flex-direction: column; gap: 0.5rem; background: #fff; }
        .grid-cell:hover .add-shift-btn { opacity: 1; }

        .shift-card { 
            padding: 0.75rem; border-radius: 1rem; font-size: 0.8rem; cursor: pointer; transition: 0.2s;
            border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .shift-card:hover { transform: scale(1.02); }
        .shift-card.draft { background: #f1f5f9; border-left: 4px solid #94a3b8; color: #475569; }
        .shift-card.published { background: #f0fdf4; border-left: 4px solid #16a34a; color: #166534; }
        .shift-time { font-weight: 800; }
        .shift-role { font-size: 0.75rem; opacity: 0.8; margin-top: 2px; }

        .add-shift-btn {
            width: 100%; padding: 0.5rem; border-radius: 0.75rem; background: #f8fafc; color: var(--text-muted);
            border: 1px dashed var(--border); opacity: 0; transition: 0.2s;
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal-content { width: 450px; padding: 2.5rem; border-radius: 2.5rem; background: white; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-header h2 { font-weight: 800; }
        .close-btn { background: none; color: var(--text-muted); }

        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
        input, select { width: 100%; padding: 0.85rem; border-radius: 1rem; border: 1px solid var(--border); font-family: inherit; font-size: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-footer { margin-top: 2rem; display: flex; align-items: center; gap: 1rem; }

        @media (max-width: 1280px) {
            .grid-corner { width: 150px; }
            .emp-sidebar { width: 150px; }
            .schedule-grid { grid-template-columns: 150px repeat(7, 120px); }
            .schedule-container { overflow-x: auto; margin: 0 -1rem; border-radius: 0; }
        }

        @media (max-width: 768px) {
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
            .header-actions button { padding: 0.75rem 0.5rem; font-size: 0.8rem; justify-content: center; }
            .calendar-controls { flex-direction: column; gap: 1rem; padding: 1.25rem 1rem; }
            .week-nav { width: 100%; justify-content: space-between; gap: 0.5rem; }
            .current-week { font-size: 0.95rem; }
            .modal-content { width: 95%; max-width: 450px; padding: 1.5rem; border-radius: 2rem; }
        }
      `}</style>
        </div>
    );
}
