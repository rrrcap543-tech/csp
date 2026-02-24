'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, CheckCircle, ShieldCheck, Pizza, ArrowRight, Loader2 } from 'lucide-react';

function AcceptInviteForm() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userData, setUserData] = useState<{ name: string, email: string } | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setLoading(false);
            setError('Invitation link is missing a token.');
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await fetch(`/api/auth/accept-invite?token=${token}`);
            const data = await res.json();
            if (res.ok) {
                setUserData(data);
            } else {
                setError(data.error || 'Invalid or expired invitation token');
            }
        } catch (err) {
            setError('Could not connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/accept-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/'), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to activate account');
            }
        } catch (err) {
            setError('Failed to activate account');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="invite-container gradient-bg">
                <Loader2 className="animate-spin text-primary" size={48} />
                <style jsx>{`
                    .invite-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    .text-primary { color: var(--primary); }
                `}</style>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="invite-container gradient-bg">
                <div className="card glass error-card">
                    <ShieldCheck size={48} className="icon-error" />
                    <h1>Invalid Invitation</h1>
                    <p>{error}</p>
                    <button onClick={() => router.push('/')} className="back-btn">Return to Login</button>
                </div>
                <style jsx>{`
                    .invite-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                    .card { width: 100%; max-width: 450px; padding: 3rem; border-radius: 2.5rem; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
                    .icon-error { color: var(--destructive); margin-bottom: 1.5rem; }
                    h1 { margin-bottom: 1rem; font-weight: 800; }
                    p { color: var(--text-muted); margin-bottom: 2rem; font-weight: 500; }
                    .back-btn { background: var(--primary); color: white; padding: 1rem 2rem; border-radius: 1rem; width: 100%; font-weight: 700; }
                `}</style>
            </div>
        );
    }

    if (success) {
        return (
            <div className="invite-container gradient-bg">
                <div className="card glass">
                    <CheckCircle size={64} className="icon-success" />
                    <h1>Welcome Aboard!</h1>
                    <p>Your account for <strong>{userData?.name}</strong> has been activated. Redirecting you to login...</p>
                </div>
                <style jsx>{`
                    .invite-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                    .card { width: 100%; max-width: 450px; padding: 4rem 3rem; border-radius: 3rem; text-align: center; background: white; border: 1px solid var(--border); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
                    .icon-success { color: #10b981; margin-bottom: 1.5rem; }
                    h1 { margin-bottom: 1rem; font-size: 2rem; font-weight: 800; }
                    p { color: var(--text-muted); line-height: 1.6; font-weight: 500; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="invite-container gradient-bg">
            <div className="card glass">
                <header className="invite-header">
                    <div className="logo-badge">
                        <Pizza className="pizza-icon" size={32} />
                        <span className="brand">CAPRINOS</span>
                    </div>
                    <h1>Create Your Account</h1>
                    <p>Welcome, <strong>{userData?.name}</strong>. Please set a secure password for your portal access.</p>
                </header>

                <form className="invite-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="text" value={userData?.email} disabled className="disabled-input" />
                    </div>

                    <div className="input-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? 'Activating...' : (
                            <>
                                <span>Activate Account</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .invite-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; color: var(--foreground); }
                .card { width: 100%; max-width: 500px; padding: 3.5rem; border-radius: 3rem; background: white; border: 1px solid var(--border); box-shadow: 0 20px 45px rgba(0,0,0,0.06); }
                .invite-header { text-align: center; margin-bottom: 2.5rem; }
                .logo-badge { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1.5rem; }
                .brand { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.5px; }
                .pizza-icon { color: var(--primary); }
                h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.5px; }
                p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; font-weight: 500; }

                .invite-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.6rem; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 1.25rem; color: var(--text-muted); }
                
                input { width: 100%; background: #f8fafc; border: 1px solid var(--border); padding: 1.1rem 1.1rem 1.1rem 3.5rem; border-radius: 1.25rem; color: var(--foreground); font-size: 1rem; }
                .disabled-input { background: #f1f5f9; border-color: #e2e8f0; color: #64748b; padding-left: 1.25rem; cursor: not-allowed; font-weight: 500; }
                
                input:focus { border-color: var(--primary); background: white; outline: none; box-shadow: 0 0 0 4px rgba(212, 18, 23, 0.05); }
                
                .error-msg { background: #fee2e2; color: #ef4444; padding: 1rem; border-radius: 1.1rem; font-size: 0.85rem; text-align: center; border: 1px solid #fecaca; font-weight: 600; }
                
                .submit-btn { width: 100%; height: 65px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; gap: 1rem; font-size: 1.1rem; font-weight: 800; border-radius: 1.5rem; margin-top: 1rem; }
                .submit-btn:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 12px 25px rgba(212, 18, 23, 0.2); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="invite-container gradient-bg">
                <Loader2 className="animate-spin text-primary" size={48} />
                <style jsx>{`
                    .invite-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    .text-primary { color: var(--primary); }
                `}</style>
            </div>
        }>
            <AcceptInviteForm />
        </Suspense>
    );
}
