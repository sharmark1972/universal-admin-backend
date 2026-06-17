'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/shared/admin/AdminSidebar';
import { LogOut, User } from 'lucide-react';

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
      router.replace('/auth/login');
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
    <div className="min-h-screen bg-gray-50">

      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-blue-700 text-lg">Admin Panel</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{session.user.firstName || session.user.email}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {session.user.role}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className={isDashboard ? '' : 'flex'}>
        {!isDashboard && (
          <AdminSidebar className="sticky top-14 hidden h-[calc(100vh-3.5rem)] self-start lg:block" />
        )}

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <AdminSidebar
              mobile
              onClose={() => setSidebarOpen(false)}
              className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] overflow-y-auto"
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
