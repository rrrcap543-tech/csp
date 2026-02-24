'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Pizza, CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => router.push('/'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <main className="login-container gradient-bg">
                <div className="login-card glass text-center">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                    <h1 className="text-2xl font-bold mb-2">Password Reset Successful</h1>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <p className="text-sm text-gray-400">Redirecting to login...</p>
                    <Link href="/" className="submit-btn text-white no-underline mt-4">
                        Go to Login Now
                    </Link>
                </div>
                <style jsx>{`
                    .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                    .login-card { width: 100%; max-width: 480px; padding: 3.5rem; border-radius: 3rem; background: white; text-align: center; }
                    .submit-btn { width: 100%; height: 60px; background: #d32f2f; color: white; display: flex; align-items: center; justify-content: center; border-radius: 1.5rem; font-weight: 800; text-decoration: none; }
                `}</style>
            </main>
        );
    }

    return (
        <main className="login-container gradient-bg">
            <div className="login-card glass">
                <header className="login-header">
                    <div className="logo-badge">
                        <Pizza className="text-red-600" size={32} />
                        <div className="flex flex-col text-left">
                            <span className="text-xl font-black leading-none">CAPRINOS</span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest">STAFF PORTAL</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mt-6">Set New Password</h1>
                    <p className="text-gray-500">Create a secure password for your account.</p>
                </header>

                {status === 'error' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <XCircle size={20} />
                        <span className="text-sm font-bold">{message}</span>
                    </div>
                )}

                <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">New Password</label>
                        <div className="relative flex items-center">
                            <Lock size={18} className="absolute left-4 text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">Confirm Password</label>
                        <div className="relative flex items-center">
                            <Lock size={18} className="absolute left-4 text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading || !token}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
            <style jsx>{`
                .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: #f8fafc; }
                .login-card { width: 100%; max-width: 480px; padding: 3.5rem; border-radius: 3rem; background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
                .logo-badge { display: flex; align-items: center; gap: 0.75rem; justify-content: center; }
                .submit-btn { width: 100%; height: 65px; background: #d32f2f; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; border-radius: 1.5rem; box-shadow: 0 8px 20px rgba(211, 47, 47, 0.2); transition: all 0.2s; }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(211, 47, 47, 0.25); }
                .submit-btn:disabled { opacity: 0.6; }

                @media (max-width: 480px) {
                    .login-card { padding: 2rem 1.25rem; border-radius: 2rem; }
                    .submit-btn { height: 55px; font-size: 1rem; }
                }
            `}</style>
        </main>
    );
}
