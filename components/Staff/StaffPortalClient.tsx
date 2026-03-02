'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogOut, Clock, Calendar, History, MapPin,
    User, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import StaffSchedule from './StaffSchedule';
import { getGeolocation } from '@/lib/utils/geo';

export default function StaffPortalClient() {
    const [user, setUser] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClockingOut, setIsClockingOut] = useState(false);
    const [clockError, setClockError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Load user from storage
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
            fetchStaffData(savedUser.email);
        } else {
            router.push('/');
        }
    }, []);

    const fetchStaffData = async (email: string) => {
        if (!email) return;
        try {
            const res = await fetch(`/api/logs?email=${email}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const activeShift = logs.find(log => log.status === 'active');
    const weeklyHours = logs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0).toFixed(1);

    const handleQuickClockOff = async () => {
        if (!user?.email) return;
        setIsClockingOut(true);
        setClockError(null);

        try {
            const pos = await getGeolocation();
            const res = await fetch('/api/clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    action: 'out',
                    remote: true,
                    location: {
                        coordinates: [pos.coords.longitude, pos.coords.latitude],
                        address: 'REMOTE_DASHBOARD'
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Request Sent: Your clock-off is awaiting admin approval.');
                fetchStaffData(user.email);
            } else {
                setClockError(data.error || 'Failed to clock off');
            }
        } catch (err: any) {
            setClockError('Location access required to clock off remotely.');
        } finally {
            setIsClockingOut(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.clear();
        setUser(null);
        setLogs([]);
        router.push('/');
    };

    return (
        <main className="staff-container gradient-bg">
            <div className="staff-content">
                {/* Header */}
                <header className="staff-header">
                    <div className="user-profile">
                        <div className="avatar">{user?.name?.[0] || 'U'}</div>
                        <div className="user-text">
                            <h1>Hi {user?.name?.split(' ')[0] || 'Staff Member'}!</h1>
                            <p>Northampton Branch • {format(new Date(), 'EEEE, MMM do')}</p>
                        </div>
                    </div>
                    <button className="logout-action-btn" onClick={handleLogout} aria-label="Log out">
                        <LogOut size={20} />
                        <span className="logout-text">Log out</span>
                    </button>
                </header>

                {/* Status Card */}
                <section className={`status-card glass ${activeShift ? 'active' : 'idle'}`}>
                    <div className="status-info">
                        <div className="status-icon">
                            {activeShift ? <Clock className="animate-pulse" /> : <AlertCircle />}
                        </div>
                        <div className="status-details">
                            <span className="status-label">{activeShift ? 'Currently Working' : 'Currently Off-Duty'}</span>
                            <span className="status-value">
                                {activeShift
                                    ? `Shift started at ${format(new Date(activeShift.clockIn), 'HH:mm')}`
                                    : 'Ready for your next shift?'}
                            </span>
                            {clockError && <p className="error-tip">{clockError}</p>}
                        </div>
                    </div>
                    {activeShift && (
                        <button
                            className="clock-off-quick"
                            onClick={handleQuickClockOff}
                            disabled={isClockingOut}
                        >
                            {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
                        </button>
                    )}
                </section>

                <StaffSchedule employeeId={user?.id} />

                {/* Dash Grid */}
                <div className="dash-grid">
                    <div className="summary-card glass">
                        <div className="card-header">
                            <TrendingUp size={20} className="icon-gold" />
                            <h3>Activity Summary</h3>
                        </div>
                        <div className="stats-row">
                            <div className="stat">
                                <span className="label">Logged Hours</span>
                                <span className="value">{weeklyHours}h</span>
                            </div>
                            <div className="stat">
                                <span className="label">Shifts Worked</span>
                                <span className="value">{logs.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button className="action-tile glass" onClick={() => router.push('/employee/history')}>
                            <div className="action-icon history"><History size={24} /></div>
                            <span>Shift History</span>
                            <ChevronRight size={18} className="chevron" />
                        </button>
                        <button
                            className="action-tile glass"
                            onClick={activeShift ? handleQuickClockOff : () => router.push('/clock-off')}
                            disabled={isClockingOut}
                        >
                            <div className="action-icon remote"><MapPin size={24} /></div>
                            <span>{isClockingOut ? 'Capturing GPS...' : 'Remote Clock Off'}</span>
                            <ChevronRight size={18} className="chevron" />
                        </button>
                    </div>
                </div>

                {/* Recent History */}
                <section className="recent-history">
                    <div className="section-header">
                        <h3>Recent Activity</h3>
                        <button className="text-link" onClick={() => router.push('/employee/history')}>See All</button>
                    </div>
                    <div className="log-stack">
                        {logs.slice(0, 3).map((log, i) => (
                            <div key={i} className="mini-log glass">
                                <div className="log-date">
                                    <span>{format(new Date(log.clockIn), 'EEE, MMM d')}</span>
                                </div>
                                <div className="log-times">
                                    {format(new Date(log.clockIn), 'HH:mm')} - {log.clockOut ? format(new Date(log.clockOut), 'HH:mm') : 'Active'}
                                </div>
                                <div className="log-hours">{log.hoursWorked || '--'}h</div>
                                <div className={`log-badge ${log.status}`}>
                                    {log.status === 'pending_approval' ? 'Awaiting Approval' :
                                        log.status === 'denied' ? 'Rejected' :
                                            log.isPaid ? 'PAID' : 'PENDING'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="staff-footer">
                    <p>© 2026 Caprinos Staff Portal • Northampton UK</p>
                </footer>
            </div>

            <style jsx>{`
        .staff-container { min-height: 100vh; padding: 3rem 1.5rem; color: var(--foreground); display: flex; justify-content: center; }
        .staff-content { width: 100%; max-width: 650px; display: flex; flex-direction: column; gap: 2.5rem; }

        .staff-header { display: flex; justify-content: space-between; align-items: center; }
        .user-profile { display: flex; align-items: center; gap: 1.25rem; }
        .avatar { width: 60px; height: 60px; border-radius: 1.5rem; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .user-text h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; letter-spacing: -0.5px; }
        .user-text p { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }
        
        .logout-action-btn { display: flex; align-items: center; gap: 0.5rem; color: var(--destructive); background: #fef2f2; padding: 0.6rem 1rem; border-radius: 1rem; font-weight: 700; transition: all 0.2s; border: 1px solid transparent; }
        .logout-action-btn:hover { background: #fee2e2; border-color: #fecaca; }
        .logout-text { font-size: 0.9rem; }

        .status-card { padding: 2rem; border-radius: 2.25rem; display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .status-card.active { border-color: #bbf7d0; background: #f0fdf4; }
        .status-info { display: flex; align-items: center; gap: 1.5rem; }
        .status-icon { width: 50px; height: 50px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: var(--secondary); border: 2px solid #f1f5f9; }
        .status-label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
        .status-value { font-size: 1.1rem; font-weight: 700; margin-top: 2px; color: var(--foreground); }
        .clock-off-quick { background: var(--primary); color: white; padding: 0.85rem 1.5rem; border-radius: 1.25rem; font-weight: 800; font-size: 0.9rem; transition: all 0.2s; }
        .clock-off-quick:hover:not(:disabled) { background: var(--primary-hover); transform: scale(1.05); }
        .clock-off-quick:disabled { background: #cbd5e1; cursor: not-allowed; opacity: 0.8; }
        .error-tip { color: #dc2626; font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem; }

        .dash-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .summary-card { padding: 2rem; border-radius: 2.25rem; background: white; border: 1px solid var(--border); }
        .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.75rem; }
        .card-header h3 { font-size: 1.25rem; font-weight: 800; }
        .icon-gold { color: var(--secondary); }
        .stats-row { display: flex; gap: 4rem; }
        .stat { display: flex; flex-direction: column; gap: 0.5rem; }
        .stat .label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .stat .value { font-size: 2rem; font-weight: 800; color: var(--foreground); }

        .quick-actions { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .action-tile { width: 100%; display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem 2rem; border-radius: 1.75rem; background: white; border: 1px solid var(--border); transition: all 0.2s; position: relative; }
        .action-tile:hover { transform: translateX(8px); border-color: var(--primary); box-shadow: 0 4px 15px rgba(212, 18, 23, 0.08); }
        .action-icon { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
        .action-icon.history { background: #eff6ff; color: #3b82f6; }
        .action-icon.remote { background: #fef2f2; color: #ef4444; }
        .action-tile span { font-weight: 800; font-size: 1.1rem; flex: 1; }
        .chevron { color: var(--text-muted); opacity: 0.4; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-header h3 { font-size: 1.25rem; font-weight: 800; }
        .text-link { background: none; color: var(--primary); font-weight: 800; font-size: 0.9rem; }

        .log-stack { display: flex; flex-direction: column; gap: 0.85rem; }
        .mini-log { padding: 1.25rem 2rem; border-radius: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: white; border: 1px solid var(--border); }
        .log-date { font-weight: 800; width: 110px; font-size: 0.95rem; }
        .log-times { color: var(--text-muted); flex: 1; font-weight: 600; font-size: 0.9rem; }
        .log-hours { font-weight: 800; color: var(--foreground); width: 60px; text-align: right; }
        .log-badge { font-size: 0.7rem; font-weight: 950; padding: 0.25rem 0.65rem; border-radius: 8px; }
        .log-badge.paid { background: #dcfce7; color: #166534; }
        .log-badge.pending_approval { background: #fffbeb; color: #92400e; }
        .log-badge.denied { background: #fef2f2; color: #dc2626; }
        .log-badge.completed { background: #f1f5f9; color: #475569; }
        .log-badge.pending { background: #f1f5f9; color: #475569; }

        .staff-footer { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem; font-weight: 600; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        @media (max-width: 640px) {
          .staff-container { padding: 1.5rem 1rem; }
          .staff-header h1 { font-size: 1.5rem; }
          .logout-text { display: none; }
          .logout-action-btn { padding: 0.75rem; }
          .status-card { flex-direction: column; gap: 1.5rem; text-align: center; padding: 1.5rem; }
          .status-info { flex-direction: column; }
          .clock-off-quick { width: 100%; border-radius: 1.25rem; }
          .dash-grid { grid-template-columns: 1fr; }
          .mini-log { padding: 1.25rem; }
          .log-times { display: none; }
          .log-date { width: auto; }
          .stats-row { gap: 2rem; justify-content: space-between; }
        }
      `}</style>
        </main >
    );
}
