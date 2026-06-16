'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Archive,
  Award,
  BarChart3,
  Book,
  Calendar,
  DollarSign,
  Eye,
  FileText,
  Globe,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/shared/ui/button';
import { getAllSites } from '@/config/sites';
import { getAdminSiteSlug } from '@/lib/admin-site';

const ALL_SITES = getAllSites();

interface AdminSidebarProps {
  className?: string;
  mobile?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, iconColor: 'text-blue-600' },
  { name: 'Users', href: '/admin/users', icon: Users, iconColor: 'text-blue-600' },
  { name: 'Team Members', href: '/admin/team-members', icon: Users, iconColor: 'text-green-600' },
  { name: 'Editorial Board', href: '/admin/editorial-board', icon: Users, iconColor: 'text-emerald-600' },
  { name: 'Advisory Board', href: '/admin/advisory-board', icon: Award, iconColor: 'text-amber-600' },
  { name: 'Reviewer Board', href: '/admin/reviewer-board', icon: Eye, iconColor: 'text-purple-600' },
  { name: 'Papers', href: '/admin/papers', icon: FileText, iconColor: 'text-green-600' },
  { name: 'Ebooks', href: '/admin/ebooks', icon: Book, iconColor: 'text-indigo-600' },
  { name: 'Conferences', href: '/admin/conferences', icon: Calendar, iconColor: 'text-indigo-600' },
  { name: 'Archives', href: '/admin/archives', icon: Archive, iconColor: 'text-amber-600' },
  { name: 'Publication Fees', href: '/admin/fees', icon: DollarSign, iconColor: 'text-green-600' },
  { name: 'Certificates', href: '/admin/certificates', icon: Award, iconColor: 'text-amber-600' },
  { name: 'Sites / Journals', href: '/admin/journals', icon: Globe, iconColor: 'text-cyan-600' },
  { name: 'Statistics', href: '/admin/statistics', icon: BarChart3, iconColor: 'text-yellow-600' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, iconColor: 'text-slate-600' },
];

export default function AdminSidebar({ className = '', mobile = false, onClose }: AdminSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeSite, setActiveSite] = useState(ALL_SITES[0].slug);

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const activeSiteConfig = ALL_SITES.find((site) => site.slug === activeSite) ?? ALL_SITES[0];

  useEffect(() => {
    setActiveSite(getAdminSiteSlug());
  }, []);

  return (
    <aside className={`w-64 flex-shrink-0 overflow-hidden bg-white shadow-lg ${className}`}>
      {mobile && (
        <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      )}

      {isSuperAdmin && (
        <div className={`border-b border-gray-100 bg-blue-50 px-4 py-3 ${mobile ? 'mt-10' : ''}`}>
          <p className="text-xs font-medium text-blue-500">Managing</p>
          <p className="text-sm font-semibold text-blue-800">{activeSiteConfig.name}</p>
        </div>
      )}

      <nav className="h-full overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${item.iconColor}`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
