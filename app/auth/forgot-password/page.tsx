'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Pizza, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="login-container gradient-bg">
                <div className="login-card glass text-center">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                    <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                    <p className="text-gray-600 mb-8">
                        If an account exists for {email}, we've sent a password reset link.
                    </p>
                    <Link href="/" className="submit-btn text-white no-underline">
                        Return to Login
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
                    <h1 className="text-3xl font-extrabold mt-6">Forgot Password?</h1>
                    <p className="text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
                </header>

                <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail size={18} className="absolute left-4 text-gray-400" />
                            <input
                                type="email"
                                placeholder="email@caprinos.co.uk"
                                className="w-full bg-gray-50 border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <Link href="/" className="flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-red-600 transition-colors no-underline mt-4">
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
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
