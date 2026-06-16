'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/shared/layout/Navbar';
import AdminSidebar from '@/components/shared/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isAdmin = session?.user?.role === 'ADMIN' || isSuperAdmin;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !isAdmin) {
      router.replace('/');
    }
  }, [router, session, status, isAdmin]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || !isAdmin) {
    return null;
  }

  const isDashboard = pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-50 [--admin-header-height:5rem] sm:[--admin-header-height:6.75rem]">

      {/* Navbar — fixed top, renders its own spacer div after itself */}
      <Navbar />

      <div className={isDashboard ? '' : 'flex'}>
        {!isDashboard && (
          <AdminSidebar className="sticky top-[var(--admin-header-height)] hidden h-[calc(100vh_-_var(--admin-header-height))] self-start lg:block" />
        )}

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <AdminSidebar
              mobile
              onClose={() => setSidebarOpen(false)}
              className="fixed left-0 top-[var(--admin-header-height)] z-50 h-[calc(100vh_-_var(--admin-header-height))] overflow-y-auto"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main>{children}</main>
        </div>
      </div>

    </div>
  );
}
