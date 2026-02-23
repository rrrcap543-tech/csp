'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffSchedule({ employeeId }: { employeeId: string }) {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    useEffect(() => {
        if (employeeId) fetchMySchedule();
    }, [weekStart, employeeId]);

    const fetchMySchedule = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/schedule?weekStart=${weekStart.toISOString()}`);
            const data = await res.json();
            // Filter for only this employee's published shifts
            setShifts(data.filter((s: any) => s.employeeId?._id === employeeId && s.status === 'published'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="staff-schedule glass">
            <header className="sect-header">
                <div>
                    <h3>Your Upcoming Rota</h3>
                    <p className="week-label">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</p>
                </div>
                <div className="nav-buttons">
                    <button className="nav-btn" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={18} /></button>
                    <button className="nav-btn" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={18} /></button>
                </div>
            </header>

            <div className="days-stack">
                {days.map(day => {
                    const shift = shifts.find(s => isSameDay(new Date(s.date), day));
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={day.toISOString()} className={`day-row ${isToday ? 'today' : ''} ${shift ? 'has-shift' : 'off'}`}>
                            <div className="day-meta">
                                <span className="d-name">{format(day, 'EEE')}</span>
                                <span className="d-date">{format(day, 'MMM d')}</span>
                            </div>

                            <div className="shift-info">
                                {shift ? (
                                    <>
                                        <div className="time-box">
                                            <Clock size={16} />
                                            <span>{shift.startTime} - {shift.endTime}</span>
                                        </div>
                                        {shift.role && (
                                            <div className="role-tag">
                                                <MapPin size={12} />
                                                <span>{shift.role}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="off-label">Day Off</span>
                                )}
                            </div>

                            {isToday && shift && <div className="now-badge">Starting Soon</div>}
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .staff-schedule { padding: 2rem; border-radius: 2.25rem; background: white; border: 1px solid var(--border); }
                .sect-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
                .sect-header h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem; }
                .week-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
                
                .nav-buttons { display: flex; gap: 0.5rem; }
                .nav-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #f8fafc; color: var(--text-muted); display: flex; align-items: center; justify-content: center; }

                .days-stack { display: flex; flex-direction: column; gap: 0.75rem; }
                .day-row { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; border-radius: 1.25rem; border: 1px solid transparent; transition: 0.2s; }
                
                .day-row.has-shift { background: #f8fafc; border-color: var(--border); }
                .day-row.off { opacity: 0.6; }
                .day-row.today { border-color: var(--primary); background: #fef2f2; }
                
                .day-meta { display: flex; flex-direction: column; width: 60px; }
                .d-name { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }
                .d-date { font-size: 1.05rem; font-weight: 800; }

                .shift-info { flex: 1; display: flex; align-items: center; gap: 1.5rem; }
                .time-box { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.1rem; }
                .role-tag { display: flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; background: rgba(59, 130, 246, 0.1); color: #2563eb; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
                
                .off-label { color: var(--text-muted); font-style: italic; font-size: 0.9rem; font-weight: 500; }
                .now-badge { background: var(--primary); color: white; padding: 0.25rem 0.65rem; border-radius: 8px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; }

                @media (max-width: 640px) {
                    .staff-schedule { padding: 1.5rem; }
                    .day-row { padding: 1rem; gap: 1rem; }
                    .shift-info { gap: 0.75rem; flex-direction: column; align-items: flex-start; }
                    .time-box { font-size: 1rem; }
                }
            `}</style>
        </section>
    );
}
