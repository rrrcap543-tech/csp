'use client';

import React, { useState, useEffect } from 'react';
import { History, Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeHistory() {
    const [email, setEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsAuthenticated(true);
            fetchHistory();
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/logs?email=${email}`);
            const data = await res.json();
            if (Array.isArray(data)) setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="history-container gradient-bg">
                <div className="login-card glass">
                    <header>
                        <History size={64} className="icon-gold" />
                        <h1>Work History</h1>
                        <p>Enter your email to view your clock-in history.</p>
                    </header>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="email@caprinos.co.uk"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">View History</button>
                    </form>
                </div>
                <style jsx>{`
                    .history-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; color: var(--foreground); }
                    .login-card { width: 100%; max-width: 420px; padding: 3.5rem 3rem; border-radius: 3rem; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
                    .icon-gold { color: var(--secondary); margin-bottom: 1.5rem; }
                    h1 { margin-bottom: 0.5rem; font-weight: 800; font-size: 2rem; }
                    p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2.5rem; font-weight: 500; }
                    .form-group { margin-bottom: 1.5rem; }
                    input { width: 100%; background: #f8fafc; border: 1px solid var(--border); padding: 1.1rem; border-radius: 1.25rem; color: var(--foreground); font-size: 1rem; outline: none; transition: 0.2s; }
                    input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(212, 18, 23, 0.05); }
                    .login-btn { width: 100%; background: var(--primary); padding: 1.1rem; border-radius: 1.25rem; color: white; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 15px rgba(212, 18, 23, 0.15); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="history-container gradient-bg">
            <div className="history-content">
                <header className="history-header">
                    <button className="back-btn" onClick={() => setIsAuthenticated(false)}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <h1>Work History</h1>
                    <div className="user-info">{email}</div>
                </header>

                <div className="summary-cards">
                    <div className="summary-card glass">
                        <span className="label">Total Hours</span>
                        <span className="value">{logs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0).toFixed(1)}h</span>
                    </div>
                    <div className="summary-card glass">
                        <span className="label">Total Shifts</span>
                        <span className="value">{logs.length}</span>
                    </div>
                </div>

                <div className="log-list">
                    {loading ? (
                        <div className="loading-state">Loading your history...</div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state">No work records found for this account.</div>
                    ) : logs.map((log) => (
                        <div key={log._id} className="log-card glass">
                            <div className="log-date">
                                <Calendar size={18} className="icon-cal" />
                                <span>{format(new Date(log.clockIn), 'EEEE, MMMM do')}</span>
                            </div>
                            <div className="log-details">
                                <div className="time-range">
                                    <Clock size={16} />
                                    <span>{format(new Date(log.clockIn), 'HH:mm')} - {log.clockOut ? format(new Date(log.clockOut), 'HH:mm') : 'Active'}</span>
                                </div>
                                <div className="hours">{log.hoursWorked || '---'} hrs</div>
                            </div>
                            {log.remarks && <div className="log-remarks">"{log.remarks}"</div>}
                            <div className={`log-status ${log.isPaid ? 'paid' : 'pending'}`}>
                                {log.isPaid ? 'PAID' : 'PENDING'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .history-container { min-height: 100vh; padding: 4rem 1.5rem; color: var(--foreground); display: flex; justify-content: center; }
                .history-content { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 2.5rem; }
                .history-header { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; margin-bottom: 0.5rem; }
                .back-btn { position: absolute; left: 0; top: 0.5rem; background: #fff; border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: 1rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; }
                .back-btn:hover { color: var(--foreground); border-color: var(--text-muted); }
                h1 { font-size: 2rem; font-weight: 800; letter-spacing: -1px; }
                .user-info { color: var(--primary); font-weight: 700; font-size: 0.85rem; padding: 0.25rem 0.75rem; background: #fef2f2; border-radius: 20px; }

                .summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .summary-card { padding: 2rem; border-radius: 2rem; display: flex; flex-direction: column; gap: 0.5rem; background: white; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                .summary-card .label { color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
                .summary-card .value { font-size: 2rem; font-weight: 900; color: var(--foreground); }

                .log-list { display: flex; flex-direction: column; gap: 1.25rem; }
                .log-card { padding: 2rem; border-radius: 2.25rem; position: relative; overflow: hidden; background: white; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .log-date { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; margin-bottom: 1.25rem; font-size: 1.05rem; }
                .icon-cal { color: var(--primary); }
                .log-details { display: flex; justify-content: space-between; align-items: center; }
                .time-range { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; }
                .hours { font-weight: 900; font-size: 1.25rem; color: var(--foreground); }
                .log-remarks { font-size: 0.9rem; color: var(--text-muted); font-style: italic; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
                
                .log-status { 
                  position: absolute; top: 1.5rem; right: -2.5rem; transform: rotate(45deg); 
                  width: 120px; text-align: center; font-size: 0.65rem; font-weight: 900; padding: 4px 0; letter-spacing: 1px;
                }
                .log-status.paid { background: #dcfce7; color: #15803d; }
                .log-status.pending { background: #f1f5f9; color: #64748b; }

                .empty-state, .loading-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); font-weight: 600; border: 2px dashed var(--border); border-radius: 2.5rem; }

                @media (max-width: 640px) {
                  .history-container { padding: 2rem 1rem; }
                  .history-header { padding-top: 4rem; text-align: center; }
                  .summary-cards { grid-template-columns: 1fr; }
                  .summary-card { padding: 1.5rem; }
                  .log-card { padding: 1.5rem; }
                  .log-details { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                  .back-btn { top: 0; left: 50%; transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
