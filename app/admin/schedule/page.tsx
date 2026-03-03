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
                fetch(`/api/schedule?weekStart=${format(weekStart, 'yyyy-MM-dd')}`)
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
                    sourceWeekStart: format(prevWeek, 'yyyy-MM-dd'),
                    targetWeekStart: format(weekStart, 'yyyy-MM-dd')
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
                body: JSON.stringify({ weekStart: format(weekStart, 'yyyy-MM-dd') })
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
            employeeId: shift.employeeId?._id || '',
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
                                    s.employeeId?._id === emp._id &&
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

        .schedule-container { 
            border-radius: 2rem; 
            overflow: auto; 
            background: white; 
            max-height: 70vh;
            border: 1px solid var(--border);
            position: relative;
        }
        .schedule-grid {
            display: grid;
            grid-template-columns: 240px repeat(7, 180px);
            min-width: max-content;
        }

        .grid-corner { 
            padding: 1.5rem; 
            background: #f8fafc; 
            font-weight: 800; 
            border-right: 2px solid var(--border); 
            border-bottom: 2px solid var(--border); 
            color: var(--text-muted);
            position: sticky;
            left: 0;
            top: 0;
            z-index: 20;
        }
        .grid-header { 
            padding: 1.25rem; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            border-right: 1px solid var(--border); 
            border-bottom: 2px solid var(--border); 
            background: #f8fafc; 
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .grid-header.today { background: #fef2f2; color: var(--primary); }
        .grid-header.today::after {
            content: 'TODAY';
            font-size: 0.6rem;
            font-weight: 900;
            margin-top: 4px;
            background: var(--primary);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .emp-sidebar { 
            padding: 1.25rem 1.5rem; 
            display: flex; 
            align-items: center; 
            gap: 1rem; 
            border-right: 2px solid var(--border); 
            border-bottom: 1px solid var(--border); 
            background: white;
            position: sticky;
            left: 0;
            z-index: 5;
        }

        .grid-cell { 
            padding: 0.75rem; 
            border-right: 1px solid var(--border); 
            border-bottom: 1px solid var(--border); 
            min-height: 120px; 
            display: flex; 
            flex-direction: column; 
            gap: 0.75rem; 
            background: #fff; 
            transition: background 0.2s;
        }
        .grid-cell:hover { background: #fdfdfd; }
        .grid-cell:hover .add-shift-btn { opacity: 1; }

        @media (max-width: 1024px) {
            .schedule-grid {
                grid-template-columns: 200px repeat(7, 160px);
            }
            .grid-corner, .emp-sidebar { width: 200px; }
        }

        @media (max-width: 768px) {
            .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
            .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
            .header-actions button { padding: 0.85rem 0.5rem; font-size: 0.85rem; justify-content: center; width: 100%; }
            .calendar-controls { flex-direction: column; gap: 1.25rem; padding: 1.5rem 1rem; }
            .week-nav { width: 100%; justify-content: space-between; }
            .current-week { font-size: 1rem; }
            
            .schedule-container { 
                margin: 0 -1.25rem; 
                border-radius: 0; 
                border-left: none; 
                border-right: none;
                max-height: none;
            }
            .schedule-grid {
                grid-template-columns: 120px repeat(7, 140px);
            }
            .grid-corner, .emp-sidebar { width: 120px; padding: 1rem; }
            .emp-name-stack .role { display: none; }
            .avatar-small { display: none; }
            
            .modal-content { 
                width: 95%; 
                max-width: 450px; 
                padding: 1.75rem; 
                border-radius: 2rem; 
            }
        }

      `}</style>
        </div>
    );
}
