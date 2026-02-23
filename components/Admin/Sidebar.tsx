'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, Banknote, LogOut, Settings, Pizza } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Employees', icon: Users, href: '/admin/employees' },
    { name: 'Schedule', icon: Calendar, href: '/admin/schedule' },
    { name: 'Payroll', icon: Banknote, href: '/admin/payroll' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-admin-header">
        <div className="logo-compact">
          <Pizza className="pizza-icon" size={24} />
          <span className="logo-name">Caprinos Admin</span>
        </div>
        <button className="mobile-logout-btn" onClick={handleLogout} aria-label="Log out">
          <LogOut size={20} />
        </button>
      </header>

      <aside className="admin-sidebar glass">
        <div className="sidebar-header">
          <div className="logo-compact">
            <Pizza className="pizza-icon" size={28} />
            <span className="logo-name">Caprinos Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <style jsx>{`
        .mobile-admin-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 0 1.5rem;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .pizza-icon {
          color: var(--primary);
        }
        .mobile-logout-btn {
          color: var(--destructive);
          background: #fef2f2;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .mobile-logout-btn:active {
          transform: scale(0.95);
          background: #fee2e2;
        }

        .admin-sidebar {
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: fixed;
          left: 0;
          top: 0;
          background: white;
          border-right: 1px solid var(--border);
          z-index: 50;
          transition: all 0.3s ease;
        }
        .sidebar-header {
          margin-bottom: 3rem;
        }
        .logo-compact {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }
        .logo-name {
          font-weight: 800;
          font-size: 1.25rem;
          white-space: nowrap;
          letter-spacing: -0.5px;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          transition: all 0.2s;
          font-weight: 700;
          white-space: nowrap;
        }
        .nav-item:hover {
          background: rgba(15, 23, 42, 0.05);
          color: var(--foreground);
        }
        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(212, 18, 23, 0.15);
        }
        .nav-item.logout {
          margin-top: auto;
          color: var(--destructive);
          width: 100%;
          text-align: left;
          background: #fef2f2;
        }
        .nav-item.logout:hover {
          background: #fee2e2;
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 80px;
            padding: 1.5rem 0.75rem;
          }
          .logo-name, .nav-item span {
            display: none;
          }
          .nav-item {
            justify-content: center;
            padding: 1rem;
          }
          .sidebar-header {
            display: flex;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .mobile-admin-header {
            display: flex;
          }
          .admin-sidebar {
            width: 100%;
            height: 70px;
            flex-direction: row;
            top: auto;
            bottom: 0;
            padding: 0 1rem;
            border-right: none;
            border-top: 1px solid var(--border);
            justify-content: space-around;
            align-items: center;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
          }
          .sidebar-header, .sidebar-footer {
            display: none;
          }
          .sidebar-nav {
            flex-direction: row;
            width: 100%;
            justify-content: space-around;
            gap: 0;
          }
          .nav-item {
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem;
            font-size: 0.7rem;
            border-radius: 0;
            background: transparent !important;
            box-shadow: none !important;
            color: var(--text-muted);
          }
          .nav-item.active {
            color: var(--primary);
          }
          .nav-item span {
            display: block;
          }
          .nav-item :global(svg) {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </>
  );
}
