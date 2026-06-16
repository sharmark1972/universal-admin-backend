'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarToggleProps {
  onClick: () => void;
}

const SidebarToggle = ({ onClick }: SidebarToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="fixed top-20 left-4 z-50 lg:hidden bg-white shadow-md hover:bg-gray-50 border border-gray-200"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default SidebarToggle;