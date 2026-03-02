'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, Clock, User, ShieldAlert, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function RemoteRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<any>(null);

    useEffect(() => {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
            setAdmin(JSON.parse(savedUserStr));
        }
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/remote-requests');
            const data = await res.json();
            if (Array.isArray(data)) setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'deny') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch('/api/admin/remote-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, adminId: admin?.id })
            });

            if (res.ok) {
                fetchRequests();
                alert(`Request ${action}d successfully`);
            } else {
                const data = await res.json();
                alert(data.error || `Failed to ${action}`);
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    };

    return (
        <div className="requests-page">
            <header className="page-header">
                <div className="title-area">
                    <h1>Remote Clock-Off Requests</h1>
                    <p>Review and approve staff clock-off events captured outside the store</p>
                </div>
            </header>

            <div className="requests-grid">
                {loading ? (
                    <div className="loading">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="empty glass">
                        <ShieldCheck size={48} className="icon-empty" />
                        <h2>All Clear!</h2>
                        <p>There are no pending remote clock-off requests at the moment.</p>
                    </div>
                ) : requests.map((req) => (
                    <div key={req._id} className="request-card glass">
                        <div className="status-indicator pending"></div>
                        <div className="card-top">
                            <div className="staff-info">
                                <div className="avatar">{req.employeeId?.name[0]}</div>
                                <div>
                                    <h3>{req.employeeId?.name}</h3>
                                    <span className="emp-id">ID: {req.employeeId?.employeeId}</span>
                                </div>
                            </div>
                            <div className="req-time">
                                <Clock size={16} />
                                <span>{format(new Date(req.requestedAt), 'HH:mm')}</span>
                            </div>
                        </div>

                        <div className="shift-details">
                            <div className="detail-row">
                                <span className="label">Clocked In</span>
                                <span className="value">{format(new Date(req.clockIn), 'MMM d, HH:mm')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Requested At</span>
                                <span className="value">{format(new Date(req.requestedAt), 'HH:mm')}</span>
                            </div>
                            <div className="detail-row location">
                                <span className="label">Remote Location</span>
                                <div className="loc-value">
                                    <MapPin size={14} className="icon-loc" />
                                    <span>{req.remoteLocation?.address || 'GPS Coordinates Provided'}</span>
                                    <br />
                                    <small className="coords">
                                        {req.remoteLocation?.coordinates?.[0].toFixed(5)}, {req.remoteLocation?.coordinates?.[1].toFixed(5)}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="card-actions">
                            <button className="deny-btn" onClick={() => handleAction(req._id, 'deny')}>
                                <X size={20} />
                                <span>Deny</span>
                            </button>
                            <button className="approve-btn" onClick={() => handleAction(req._id, 'approve')}>
                                <Check size={20} />
                                <span>Approve Shift</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .requests-page { padding: 1rem; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--foreground); margin-bottom: 0.5rem; }
                .page-header p { color: var(--text-muted); font-weight: 500; }

                .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
                
                .loading, .empty { grid-column: 1 / -1; padding: 5rem 2rem; text-align: center; border-radius: 2rem; border: 2px dashed var(--border); }
                .icon-empty { color: #10b981; margin-bottom: 1.5rem; }
                .empty h2 { font-weight: 800; margin-bottom: 0.5rem; }
                .empty p { color: var(--text-muted); }

                .request-card { padding: 2rem; border-radius: 2rem; position: relative; border: 1px solid var(--border); transition: all 0.3s ease; display: flex; flex-direction: column; background: white; }
                .request-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.06); }
                
                .status-indicator { position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 4px 4px 0 0; }
                .status-indicator.pending { background: #fdb813; }

                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .staff-info { display: flex; align-items: center; gap: 1rem; }
                .avatar { width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
                .staff-info h3 { font-size: 1.1rem; font-weight: 800; }
                .emp-id { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
                .req-time { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: #fffbeb; color: #92400e; border-radius: 12px; font-weight: 800; font-size: 0.85rem; }

                .shift-details { background: #f8fafc; padding: 1.5rem; border-radius: 1.5rem; margin-bottom: 2rem; flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
                .detail-row { display: flex; justify-content: space-between; align-items: flex-start; }
                .detail-row.location { flex-direction: column; gap: 0.5rem; }
                .label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
                .value { font-weight: 700; font-size: 0.95rem; }
                .loc-value { color: var(--foreground); font-weight: 700; font-size: 0.9rem; }
                .icon-loc { color: var(--primary); margin-right: 0.4rem; transform: translateY(-1px); }
                .coords { color: var(--text-muted); font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }

                .card-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
                .deny-btn { height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #fef2f2; color: #dc2626; font-weight: 700; }
                .deny-btn:hover { background: #fee2e2; }
                .approve-btn { height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--primary); color: white; font-weight: 800; }
                .approve-btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 18, 23, 0.2); }

                @media (max-width: 640px) {
                    .requests-grid { grid-template-columns: 1fr; }
                    .request-card { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
