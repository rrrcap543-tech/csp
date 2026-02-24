'use client';

import React from 'react';
import { Users, Clock, Banknote, TrendingUp, MoreVertical } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = React.useState<any>(null);
    const [admin, setAdmin] = React.useState<any>(null);
    const [isClockedIn, setIsClockedIn] = React.useState(false);
    const [clocking, setClocking] = React.useState(false);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setAdmin(user);
            checkClockStatus(user.id);
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/stats');
            const d = await res.json();
            setData(d);
        } catch (err) {
            console.error(err);
        }
    };

    const checkClockStatus = async (id: string) => {
        try {
            const res = await fetch(`/api/logs?employeeId=${id}`);
            const logs = await res.json();
            const active = logs.find((l: any) => l.status === 'active');
            setIsClockedIn(!!active);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClockAction = async () => {
        if (!admin) return;
        setClocking(true);
        try {
            const res = await fetch('/api/clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: admin.employeeId, // Assuming employeeId is stored in user object
                    email: admin.email,
                    action: isClockedIn ? 'out' : 'in',
                    location: { address: 'ADMIN_DASHBOARD' }
                })
            });
            if (res.ok) {
                setIsClockedIn(!isClockedIn);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Clock failed');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setClocking(false);
        }
    };

    const stats = [
        { title: 'Active Staff', value: data?.activeStaff || '0', icon: Clock, color: '#22c55e', trend: 'Live from store' },
        { title: 'Total Employees', value: data?.totalEmployees || '0', icon: Users, color: '#3b82f6', trend: 'Northampton UK' },
        { title: 'Weekly Hours', value: `${data?.totalHours || 0}h`, icon: TrendingUp, color: '#f59e0b', trend: 'Last 7 days' },
        { title: 'Pending Payroll', value: data?.pendingPayroll || '0', icon: Banknote, color: '#ef4444', trend: 'Mark as paid' },
    ];

    const recentActivity = data?.recentActivity || [];

    return (
        <div className="dashboard-content">
            <header className="dashboard-header">
                <div className="flex justify-between items-start">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, {admin?.name || 'Admin'}. Here's what's happening today at Northampton.</p>
                    </div>
                    <button
                        className={`clock-btn ${isClockedIn ? 'out' : 'in'}`}
                        onClick={handleClockAction}
                        disabled={clocking}
                    >
                        <Clock size={20} />
                        <span>{clocking ? 'Processing...' : (isClockedIn ? 'Stop Personal Shift' : 'Start Personal Shift')}</span>
                    </button>
                </div>
            </header>

            <section className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.title} className="stat-card glass">
                        <div className="stat-header">
                            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <button className="icon-btn"><MoreVertical size={20} /></button>
                        </div>
                        <div className="stat-body">
                            <h3>{stat.value}</h3>
                            <p className="stat-title">{stat.title}</p>
                        </div>
                        <div className="stat-footer">
                            <span className="trend">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="dashboard-grid">
                <section className="activity-list glass">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                        <button className="text-btn">View All</button>
                    </div>
                    <div className="activity-items">
                        {recentActivity.map((item: any, i: number) => (
                            <div key={i} className="activity-item">
                                <div className="avatar-placeholder">{item.name[0]}</div>
                                <div className="activity-details">
                                    <span className="name">{item.name} <span className="id">({item.id})</span></span>
                                    <span className="action">{item.action} at <span className="time">{item.time}</span></span>
                                </div>
                                <div className="status-dot"></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="chart-placeholder glass">
                    <div className="section-header">
                        <h2>Efficiency Stats</h2>
                    </div>
                    <div className="chart-dummy">
                        <div className="bar" style={{ height: '60%' }}></div>
                        <div className="bar" style={{ height: '80%' }}></div>
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '70%' }}></div>
                        <div className="bar" style={{ height: '50%' }}></div>
                        <div className="bar" style={{ height: '30%' }}></div>
                    </div>
                    <div className="chart-labels">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                </section>
            </div>

            <style jsx>{`
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-start { align-items: flex-start; }
        
        .clock-btn {
          display: flex; align-items: center; gap: 0.75rem; 
          padding: 0.85rem 1.5rem; border-radius: 1rem; font-weight: 700;
          transition: all 0.2s;
        }
        .clock-btn.in { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .clock-btn.out { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .clock-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .clock-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .dashboard-header { margin-bottom: 2rem; }
        .dashboard-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .dashboard-header p { color: var(--text-muted); }

        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 1.5rem; 
          margin-bottom: 2rem;
        }
        .stat-card { padding: 1.5rem; border-radius: 1.5rem; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-body h3 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
        .stat-title { color: var(--text-muted); font-size: 0.9rem; }
        .stat-footer { margin-top: 1rem; font-size: 0.85rem; color: #22c55e; }

        .dashboard-grid { 
          display: grid; 
          grid-template-columns: 1fr 400px; 
          gap: 1.5rem; 
        }

        @media (max-width: 1280px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-header h1 {
            font-size: 1.5rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .activity-list {
            padding: 1rem;
          }
        }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .activity-list { padding: 2rem; border-radius: 2rem; }
        .activity-items { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item { 
          display: flex; 
          align-items: center; 
          gap: 1rem; 
          padding: 1rem; 
          border-radius: 1rem; 
          background: rgba(15, 23, 42, 0.03); 
          transition: 0.2s;
        }
        .activity-item:hover { background: rgba(15, 23, 42, 0.05); }
        .avatar-placeholder { 
          width: 40px; height: 40px; border-radius: 50%; background: var(--primary); 
          display: flex; align-items: center; justify-content: center; font-weight: 700; color: white;
        }
        .activity-details { display: flex; flex-direction: column; flex: 1; }
        .name { font-weight: 600; font-size: 0.95rem; }
        .id { color: var(--text-muted); font-size: 0.8rem; }
        .action { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; }
        .time { color: var(--foreground); font-weight: 600; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }

        .chart-placeholder { padding: 2rem; border-radius: 2rem; display: flex; flex-direction: column; }
        .chart-dummy { flex: 1; display: flex; align-items: flex-end; gap: 1rem; height: 200px; margin-bottom: 1rem; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .bar { flex: 1; background: linear-gradient(to top, var(--primary), var(--secondary)); border-radius: 8px 8px 0 0; min-height: 10px; }
        .chart-labels { display: flex; justify-content: space-between; padding: 0 10px; color: var(--text-muted); font-size: 0.8rem; }

        .icon-btn, .text-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        .text-btn { color: var(--primary); font-weight: 600; }
      `}</style>
        </div>
    );
}
