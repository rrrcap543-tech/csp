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
          background: var(--background);
          flex-direction: column;
        }
        .admin-main {
          margin-left: 260px;
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          transition: all 0.3s ease;
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 80px;
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .admin-layout {
            padding-top: 60px; /* Space for mobile header */
            padding-bottom: 70px; /* Space for mobile nav */
          }
          .admin-main {
            margin-left: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
