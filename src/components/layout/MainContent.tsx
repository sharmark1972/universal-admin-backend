'use client';

import { useSession } from 'next-auth/react';
import UserStatusAlert from '@/components/auth/UserStatusAlert';
import { BreadcrumbContainer } from '@/components/ui/Breadcrumbs';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      {/* Main content area */}
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out">
        {session && (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2">
            <UserStatusAlert />
          </div>
        )}
        <div className="p-4 lg:p-6">
          <BreadcrumbContainer className="mb-4" />
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainContent;