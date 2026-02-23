'use client';

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Delete, HelpCircle } from 'lucide-react';

export default function KioskClient() {
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClockIn = async () => {
    if (!pin) return;
    try {
      const res = await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: pin, action: 'in' })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `${data.message}` });
        setPin('');
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error' });
    }
    setTimeout(() => setStatus({ type: null, message: '' }), 5000);
  };

  const handleClockOut = async () => {
    if (!pin) return;
    try {
      const res = await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: pin, action: 'out' })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `${data.message}` });
        setPin('');
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error' });
    }
    setTimeout(() => setStatus({ type: null, message: '' }), 5000);
  };

  const handleExit = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <main className="kiosk-container gradient-bg">
      <div className="kiosk-content">
        {/* Header Section */}
        <header className="kiosk-header">
          <div className="logo-placeholder">
            <span className="logo-text">CAPRINOS</span>
            <span className="logo-subtext">STAFF CLOCK</span>
          </div>
          <div className="clock-display glass">
            <Clock className="icon-gold" />
            <div className="time-column">
              <span className="time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="date">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Status Message */}
        <div className={`status-banner ${status.type} ${status.type ? 'visible' : ''}`}>
          {status.message}
        </div>

        {/* Input Section */}
        <div className="input-section glass">
          <div className="pin-display">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'active' : ''}`}>
                {pin[i] || ''}
              </div>
            ))}
          </div>
          <p className="input-label">Enter Your Employee PIN</p>
        </div>

        {/* Keypad & Actions */}
        <div className="interaction-grid">
          <div className="keypad glass">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handleKeyPress(num.toString())} className="key-button">
                {num}
              </button>
            ))}
            <button onClick={handleClear} className="key-button clear">CLR</button>
            <button onClick={() => handleKeyPress('0')} className="key-button">0</button>
            <button onClick={handleBackspace} className="key-button backspace">
              <Delete size={28} />
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={handleClockIn} className="action-button clock-in">
              <LogIn size={32} />
              <span>CLOCK IN</span>
            </button>
            <button onClick={handleClockOut} className="action-button clock-out">
              <LogOut size={32} />
              <span>CLOCK OUT</span>
            </button>
            <button onClick={handleExit} className="action-button logout-kiosk">
              <LogOut size={24} />
              <span>EXIT DEVICE</span>
            </button>
            <button className="action-button help">
              <HelpCircle size={24} />
              <span>HELP</span>
            </button>
          </div>
        </div>

        <footer className="kiosk-footer">
          <p>© 2026 Caprinos Pizza • Northampton UK Store Portal</p>
        </footer>
      </div>

      <style jsx>{`
        .kiosk-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--foreground);
          padding: 2rem;
        }
        .kiosk-content {
          width: 100%;
          max-width: 950px;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .kiosk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-text {
          font-size: 2.75rem;
          font-weight: 950;
          color: var(--primary);
          letter-spacing: -1.5px;
        }
        .logo-subtext {
          font-size: 1.1rem;
          display: block;
          color: var(--secondary);
          margin-top: -8px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .clock-display {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 2.5rem;
          border-radius: 2rem;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .icon-gold {
          color: var(--secondary);
          width: 48px;
          height: 48px;
        }
        .time-column {
          display: flex;
          flex-direction: column;
        }
        .time {
          font-size: 2.25rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .date {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 600;
          margin-top: 4px;
        }
        .status-banner {
          padding: 1.25rem;
          border-radius: 1.25rem;
          text-align: center;
          font-weight: 700;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(-15px);
          font-size: 1.1rem;
        }
        .status-banner.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .status-banner.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-banner.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .input-section {
          padding: 3rem;
          border-radius: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          background: white;
        }
        .pin-display {
          display: flex;
          gap: 1rem;
        }
        .pin-dot {
          width: 65px;
          height: 80px;
          border: 2px solid #e2e8f0;
          border-radius: 1.25rem;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2.5rem;
          font-weight: 800;
          background: #f8fafc;
          transition: all 0.2s;
          color: var(--primary);
        }
        .pin-dot.active {
          border-color: var(--secondary);
          background: white;
          box-shadow: 0 0 20px rgba(253, 184, 19, 0.2);
          transform: scale(1.05);
        }
        .input-label {
          color: var(--text-muted);
          font-weight: 700;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .interaction-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
        }
        .keypad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          padding: 2rem;
          border-radius: 2.5rem;
          background: white;
        }
        .key-button {
          height: 90px;
          background: #f1f5f9;
          color: #334155;
          font-size: 2.25rem;
          font-weight: 800;
          border-radius: 1.5rem;
          transition: all 0.2s;
        }
        .key-button:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }
        .key-button.clear { color: #ef4444; background: #fff1f2; }
        .key-button.backspace { color: #64748b; background: #f8fafc; }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 1.25rem;
          font-weight: 800;
          border-radius: 1.5rem;
          transition: all 0.2s;
        }
        .clock-in {
          background: #10b981;
          color: white;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }
        .clock-in:hover { background: #059669; transform: translateY(-3px); }
        .clock-out {
          background: #ef4444;
          color: white;
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
        }
        .clock-out:hover { background: #dc2626; transform: translateY(-3px); }
        .logout-kiosk {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid var(--border);
          font-size: 1rem;
        }
        .help {
          background: #f8fafc;
          border: 1px solid var(--border);
          color: #94a3b8;
          font-size: 1rem;
        }
        
        .kiosk-footer {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
           .kiosk-container { padding: 1rem; }
           .kiosk-header { flex-direction: column; gap: 1.5rem; text-align: center; }
           .logo-text { font-size: 2rem; }
           .clock-display { width: 100%; justify-content: center; }
           
           .pin-dot { width: 45px; height: 55px; font-size: 1.5rem; }
          .interaction-grid {
            grid-template-columns: 1fr;
          }
          .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .action-button {
            padding: 1.25rem;
            font-size: 1rem;
          }
          .logout-kiosk, .help { grid-column: span 1; }
        }

        @media (max-width: 480px) {
           .pin-dot { width: 38px; height: 50px; font-size: 1.25rem; }
           .pin-display { gap: 0.5rem; }
           .key-button { height: 70px; font-size: 1.75rem; }
        }
      `}</style>
    </main>
  );
}
