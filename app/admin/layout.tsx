'use client';

import AdminSidebar from "@/components/Admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>

      <style jsx global>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          flex-direction: column;
          overflow-x: hidden;
        }
        .admin-main {
          margin-left: 260px;
          flex: 1;
          padding: 2.5rem;
          max-width: 1400px;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-right: auto;
        }

        @media (max-width: 1200px) {
          .admin-main {
            padding: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 80px;
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .admin-layout {
            padding-top: 64px; /* Space for mobile header */
            padding-bottom: 84px; /* Space for mobile nav + safety */
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 1.25rem;
            width: 100%;
            max-width: 100vw;
          }
        }

        /* Utility for glassmorphism used across admin */
        .glass {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.05) !important;
        }

      `}</style>
    </div>
  );
}
