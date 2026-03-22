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
                                <span className="name">{emp.name}</span>
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
        .schedule-page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2.25rem; font-weight: 800; color: #1a1a1a; letter-spacing: -0.02em; }
        .page-header p { color: #64748b; font-size: 1rem; margin-top: 0.25rem; }
        .header-actions { display: flex; gap: 1rem; }

        .primary-btn, .secondary-btn, .cancel-btn, .delete-btn {
            display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: 700; font-size: 0.9rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        .primary-btn { background: #d41217; color: white; border: none; box-shadow: 0 4px 12px rgba(212, 18, 23, 0.15); }
        .primary-btn:hover { background: #b90e12; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(212, 18, 23, 0.2); }
        .secondary-btn { background: white; border: 1px solid #e2e8f0; color: #1e293b; }
        .secondary-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .cancel-btn { color: #64748b; background: transparent; border: none; }
        .cancel-btn:hover { color: #1e293b; }
        .delete-btn { color: #dc2626; background: #fef2f2; border: 1px solid #fee2e2; }
        .delete-btn:hover { background: #fee2e2; border-color: #fecaca; }
        .flex-spacer { flex: 1; }

        .calendar-controls { 
            padding: 1rem 2rem; 
            border-radius: 1.5rem; 
            margin-bottom: 1.5rem; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }
        .week-nav { display: flex; align-items: center; gap: 1rem; }
        .current-week { display: flex; align-items: center; gap: 0.75rem; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
        .icon-btn { 
            width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; 
            border-radius: 50%; border: 1px solid #e2e8f0; background: white; color: #64748b;
            transition: all 0.2s;
        }
        .icon-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
        .icon-red { color: #d41217; }
        
        .legend { display: flex; gap: 1.25rem; font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .legend-item { display: flex; align-items: center; gap: 0.4rem; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.draft { background: #94a3b8; }
        .dot.published { background: #16a34a; }

        .schedule-container { 
            border-radius: 1.5rem; 
            overflow: auto; 
            background: white; 
            max-height: calc(100vh - 350px);
            border: 1px solid #e2e8f0;
            position: relative;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
        }
        .schedule-grid {
            display: grid;
            grid-template-columns: 200px repeat(7, 1fr);
            min-width: 1200px;
        }

        .grid-corner { 
            padding: 1.25rem; 
            background: #f8fafc; 
            font-weight: 700; 
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-right: 1px solid #e2e8f0; 
            border-bottom: 2px solid #e2e8f0; 
            color: #64748b;
            position: sticky;
            left: 0;
            top: 0;
            z-index: 20;
        }
        .grid-header { 
            padding: 1rem; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            border-right: 1px solid #e2e8f0; 
            border-bottom: 2px solid #e2e8f0; 
            background: #f8fafc; 
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .day-name { font-weight: 800; font-size: 0.9rem; color: #1e293b; }
        .day-date { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        
        .grid-header.today { background: #fff1f2; }
        .grid-header.today .day-name { color: #d41217; }
        .grid-header.today .day-date { color: #e11d48; }

        .emp-sidebar { 
            padding: 1.25rem 1.5rem; 
            display: flex; 
            align-items: center; 
            background: white;
            border-right: 1px solid #e2e8f0; 
            border-bottom: 1px solid #e2e8f0; 
            font-weight: 700;
            color: #1e293b;
            font-size: 0.95rem;
            position: sticky;
            left: 0;
            z-index: 5;
        }

        .grid-cell { 
            padding: 0.6rem; 
            border-right: 1px solid #f1f5f9; 
            border-bottom: 1px solid #f1f5f9; 
            min-height: 100px; 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem; 
            background: #fff; 
            transition: background 0.2s;
            position: relative;
        }
        .grid-cell:hover { background: #fbfcfe; }
        
        .shift-card {
            padding: 0.75rem;
            border-radius: 0.75rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }
        .shift-card:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        
        .shift-card.draft { 
            background: #f1f5f9; color: #475569; border-color: #e2e8f0;
            border-left: 4px solid #94a3b8;
        }
        .shift-card.published { 
            background: #f0fdf4; color: #166534; border-color: #dcfce7;
            border-left: 4px solid #22c55e;
        }
        
        .shift-time { font-weight: 800; margin-bottom: 0.25rem; }
        .shift-role { font-weight: 500; opacity: 0.8; font-size: 0.75rem; }

        .add-shift-btn { 
            opacity: 0; border: none; background: #f1f5f9; color: #64748b; 
            border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s; cursor: pointer; width: 24px; height: 24px;
            position: absolute; bottom: 8px; right: 8px;
        }
        .grid-cell:hover .add-shift-btn { opacity: 1; }
        .add-shift-btn:hover { background: #e2e8f0; color: #1e293b; }

        .modal-overlay { 
            position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
            backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content { 
            width: 90%; max-width: 500px; padding: 2rem; border-radius: 1.5rem; background: white;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .close-btn { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }
        
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
        .form-group select, .form-group input { 
            width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; 
            font-size: 0.95rem; color: #1e293b; transition: all 0.2s;
        }
        .form-group select:focus, .form-group input:focus { border-color: #d41217; outline: none; box-shadow: 0 0 0 3px rgba(212, 18, 23, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        @media (max-width: 1024px) {
            .schedule-page { padding: 1rem; }
            .schedule-grid { grid-template-columns: 140px repeat(7, 160px); }
        }

        @media (max-width: 768px) {
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .header-actions { width: 100%; }
            .header-actions button { flex: 1; padding: 0.6rem; font-size: 0.8rem; }
            .calendar-controls { flex-direction: column; gap: 1rem; padding: 1rem; }
            .week-nav { width: 100%; justify-content: space-between; }
            
            .schedule-container { 
                margin: 0 -1rem; border-radius: 0; border-left: none; border-right: none;
                max-height: calc(100vh - 250px);
            }
            .schedule-grid { grid-template-columns: 100px repeat(7, 140px); }
            .grid-corner, .emp-sidebar { width: 100px; padding: 0.75rem 0.5rem; font-size: 0.8rem; }
        }

      `}</style>
        </div>
    );
}
