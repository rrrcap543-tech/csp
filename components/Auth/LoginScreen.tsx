'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Shield, User, Lock, ArrowRight, Pizza } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin' | 'staff'>('kiosk');
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: credentials.id,
          password: credentials.password,
          mode: activeTab
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (activeTab === 'kiosk') {
          router.push('/kiosk');
        } else if (activeTab === 'staff') {
          router.push('/staff');
        } else {
          router.push('/admin');
        }
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container gradient-bg">
      <div className="login-card glass">
        <header className="login-header">
          <div className="logo-badge">
            <Pizza className="pizza-icon" size={32} />
            <div className="logo-text-group">
              <span className="brand">CAPRINOS</span>
              <span className="sub-brand">STAFF PORTAL</span>
            </div>
          </div>
          <h1>System Access</h1>
          <p>Please select your access mode and authenticate.</p>
        </header>

        <div className="mode-selector">
          <button
            className={`mode-btn ${activeTab === 'kiosk' ? 'active' : ''}`}
            onClick={() => setActiveTab('kiosk')}
            data-mode="Kiosk"
          >
            <Monitor size={18} />
            <span>Kiosk Mode</span>
          </button>
          <button
            className={`mode-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
            data-mode="Staff"
          >
            <User size={18} />
            <span>Staff Portal</span>
          </button>
          <button
            className={`mode-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            data-mode="Admin"
          >
            <Shield size={18} />
            <span>Admin</span>
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>{activeTab === 'kiosk' ? 'Kiosk Username' : 'Email Address'}</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type={activeTab === 'kiosk' ? 'text' : 'email'}
                placeholder={activeTab === 'kiosk' ? 'e.g. counter_kiosk_1' : 'admin@caprinos.co.uk'}
                value={credentials.id}
                onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Access PIN / Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me logged in</label>
            </div>
            <Link href="/auth/forgot-password" title="Reset your password" className="forgot-link">Forgot?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                <span>Enter Portal</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <footer className="login-footer">
          <p>Secure Access for Caprinos Pizza Northampton UK</p>
          <div className="links">
            <span className="version">v2.2.0</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          color: var(--foreground);
        }
        .login-card {
          width: 100%;
          max-width: 480px;
          padding: 3.5rem;
          border-radius: 3rem;
          box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.1);
          background: white;
        }
        .logo-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .pizza-icon {
          color: var(--primary);
        }
        .logo-text-group {
          display: flex;
          flex-direction: column;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .sub-brand {
          font-size: 0.75rem;
          color: var(--secondary);
          font-weight: 800;
          letter-spacing: 2px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .login-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .mode-selector {
          display: flex;
          background: #f1f5f9;
          padding: 0.4rem;
          border-radius: 1.25rem;
          margin-bottom: 2.5rem;
          gap: 0.4rem;
        }
        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.85rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
        }
        .mode-btn.active {
          background: white;
          color: var(--foreground);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
          margin-left: 0.25rem;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1.25rem;
          color: var(--text-muted);
        }
        input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--border);
          padding: 1.1rem 1.1rem 1.1rem 3.5rem;
          border-radius: 1.25rem;
          color: var(--foreground);
          font-size: 1rem;
          transition: all 0.2s;
        }
        input:focus {
          border-color: var(--primary);
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(212, 18, 23, 0.05);
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          margin-top: -0.5rem;
        }
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .remember-me input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }
        .forgot-link {
          color: var(--primary);
          font-weight: 700;
        }

        .submit-btn {
          width: 100%;
          height: 65px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 1.1rem;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(212, 18, 23, 0.2);
          border-radius: 1.5rem;
          margin-top: 1rem;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(212, 18, 23, 0.25);
        }
        .submit-btn:active {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 3.5rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .version {
          font-weight: 700;
          color: var(--secondary);
          margin-top: 0.5rem;
          display: block;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.25rem;
            border-radius: 2rem;
          }
          .login-header h1 {
            font-size: 1.75rem;
          }
          .mode-btn span {
            display: none;
          }
           .mode-btn::after {
            content: attr(data-mode);
          }
          .submit-btn {
            height: 55px;
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
