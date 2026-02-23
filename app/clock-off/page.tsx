'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { getGeolocation } from '@/lib/utils/geo';

export default function RemoteClockOff() {
    const [loading, setLoading] = useState(false);
    const [geoStatus, setGeoStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [location, setLocation] = useState<any>(null);
    const [status, setStatus] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setIsAuthenticated(true);
    };

    const handleClockOff = async () => {
        setLoading(true);
        try {
            const pos = await getGeolocation();
            const loc = {
                coordinates: [pos.coords.longitude, pos.coords.latitude],
                accuracy: pos.coords.accuracy
            };
            setLocation(loc);
            setGeoStatus('granted');

            const res = await fetch('/api/clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    action: 'out',
                    location: { coordinates: loc.coordinates, address: 'REMOTE_MOBILE' },
                    remote: true
                })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Clocked off successfully!' });
            } else {
                setStatus({ type: 'error', message: data.error });
            }
        } catch (err: any) {
            setGeoStatus('denied');
            setStatus({ type: 'error', message: 'Location access is REQUIRED to clock off remotely.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="remote-container gradient-bg">
                <div className="login-card glass">
                    <header>
                        <div className="logo-placeholder">CAPRINOS</div>
                        <h1>Remote Access</h1>
                        <p>Please enter your registered email to continue.</p>
                    </header>
                    <form onSubmit={handleLogin}>
                        <div className="input-field">
                            <input
                                type="email"
                                placeholder="email@caprinos.co.uk"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">Authenticate</button>
                    </form>
                </div>
                <style jsx>{`
                    .remote-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; color: var(--foreground); }
                    .login-card { width: 100%; max-width: 400px; padding: 3rem; border-radius: 2.5rem; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                    .logo-placeholder { color: var(--primary); font-weight: 950; font-size: 1.75rem; margin-bottom: 1rem; letter-spacing: -1px; }
                    h1 { margin-bottom: 0.5rem; font-weight: 800; }
                    p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2.5rem; font-weight: 500; }
                    .input-field { margin-bottom: 1.5rem; }
                    input { width: 100%; background: #f8fafc; border: 1px solid var(--border); padding: 1.1rem; border-radius: 1.25rem; color: var(--foreground); outline: none; transition: 0.2s; font-size: 1rem; }
                    input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(212, 18, 23, 0.05); }
                    .login-btn { width: 100%; background: var(--primary); padding: 1.1rem; border-radius: 1.25rem; color: white; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 15px rgba(212, 18, 23, 0.2); }
                    .login-btn:hover { background: var(--primary-hover); transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="remote-container gradient-bg">
            <div className="clock-off-card glass">
                <header>
                    <div className="user-profile">
                        <div className="avatar">{email[0].toUpperCase()}</div>
                        <div className="user-text">
                            <span className="email">{email}</span>
                            <span className="status">Active Shift</span>
                        </div>
                    </div>
                </header>

                <section className="location-verify">
                    {geoStatus === 'denied' ? (
                        <div className="geo-box denied">
                            <ShieldAlert size={40} />
                            <h3>Location Denied</h3>
                            <p>You must allow location access to clock off from outside the store.</p>
                        </div>
                    ) : location ? (
                        <div className="geo-box granted">
                            <ShieldCheck size={40} />
                            <h3>Location Verified</h3>
                            <p>Coords: {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}</p>
                        </div>
                    ) : (
                        <div className="geo-box prompt">
                            <MapPin size={40} />
                            <h3>Ready to Clock Off?</h3>
                            <p>We'll verify your location to record your clock-off event.</p>
                        </div>
                    )}
                </section>

                {status && (
                    <div className={`status-msg ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <button
                    onClick={handleClockOff}
                    className="clock-off-btn"
                    disabled={loading || status?.type === 'success'}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <LogOut size={24} />}
                    <span>{status?.type === 'success' ? 'Clocked Off' : 'Clock Off Now'}</span>
                </button>

                <p className="note">Note: Your current location will be stored with this entry.</p>
            </div>

            <style jsx>{`
                .remote-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; color: var(--foreground); }
                .clock-off-card { width: 100%; max-width: 450px; padding: 2.5rem; border-radius: 3rem; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
                
                .user-profile { background: #f1f5f9; padding: 1.25rem; border-radius: 1.75rem; display: flex; align-items: center; gap: 1rem; text-align: left; margin-bottom: 2.5rem; }
                .avatar { width: 50px; height: 50px; border-radius: 50%; background: var(--secondary); color: #854d0e; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
                .email { display: block; font-weight: 700; font-size: 1rem; color: var(--foreground); }
                .status { font-size: 0.75rem; color: #16a34a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

                .location-verify { margin-bottom: 2.5rem; }
                .geo-box { padding: 3rem 1.5rem; border-radius: 2rem; background: #f8fafc; display: flex; flex-direction: column; align-items: center; gap: 1rem; border: 1px dashed var(--border); }
                .geo-box.denied { border-color: var(--destructive); color: var(--destructive); background: #fef2f2; }
                .geo-box.granted { border-color: #16a34a; color: #16a34a; background: #f0fdf4; border-style: solid; }
                .geo-box h3 { font-size: 1.25rem; font-weight: 800; }
                .geo-box p { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }

                .status-msg { margin-bottom: 1.5rem; padding: 1.25rem; border-radius: 1.25rem; font-weight: 700; font-size: 0.95rem; }
                .status-msg.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .status-msg.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

                .clock-off-btn { width: 100%; height: 75px; background: var(--primary); border-radius: 1.75rem; color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; font-size: 1.25rem; font-weight: 800; box-shadow: 0 10px 25px rgba(212, 18, 23, 0.2); }
                .clock-off-btn:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-3px); box-shadow: 0 15px 30px rgba(212, 18, 23, 0.3); }
                .clock-off-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .note { margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }

                @media (max-width: 480px) {
                  .remote-container { padding: 1rem; }
                  .clock-off-card, .login-card { padding: 2rem 1.5rem; border-radius: 2rem; }
                  .geo-box { padding: 2.5rem 1rem; }
                  .geo-box h3 { font-size: 1.15rem; }
                  .clock-off-btn { height: 65px; font-size: 1.15rem; }
                  .user-profile { padding: 1rem; border-radius: 1.25rem; }
                }
            `}</style>
        </div>
    );
}
