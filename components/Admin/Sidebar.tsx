'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, Banknote, LogOut, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Employees', icon: Users, href: '/admin/employees' },
    { name: 'Schedule', icon: Calendar, href: '/admin/schedule' },
    { name: 'Payroll', icon: Banknote, href: '/admin/payroll' },
  ];

  return (
    <aside className="admin-sidebar glass">
      <div className="sidebar-header">
        <div className="logo-compact">
          <span className="logo-c">C</span>
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
        <button className="nav-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .admin-sidebar {
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: fixed;
          left: 0;
          top: 0;
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
        .logo-c {
          background: var(--primary);
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 900;
          color: white;
        }
        .logo-name {
          font-weight: 700;
          font-size: 1.1rem;
          white-space: nowrap;
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
          font-weight: 500;
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
          background: none;
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
          }
          .nav-item span {
            display: block;
          }
          .nav-item :global(svg) {
            width: 20px;
            height: 20px;
          }
          .nav-item.active {
            background: transparent;
            color: var(--primary);
          }
        }
      `}</style>
    </aside>
  );
}
