'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/shared/admin/AdminSidebar';
import { adminFetch } from '@/lib/admin-fetch';
import { getAdminSiteSlug, setAdminSiteSlug } from '@/lib/admin-site';
import { useAdminStore } from '@/store/adminStore';
import { getAllSites } from '@/config/sites';
import Link from 'next/link';
import { LogOut, Search, Settings, Globe, ArrowRight } from 'lucide-react';

const ALL_SITES = getAllSites();

interface SearchResult {
  type: 'Paper' | 'User' | 'Conference';
  id: string;
  title?: string;
  name?: string;
  email?: string;
  firstName?: string;
  authors?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeSite, setActiveSite] = useState(ALL_SITES[0].slug);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    invalidateStats, invalidateUsers, invalidatePapers, invalidateConferences,
    invalidateEbooks, invalidateCertificates, invalidateJournals, invalidateTeamMembers,
    invalidateEditorial, invalidateArchives, invalidateAnalytics, invalidateSettings,
    invalidateAdvisory, invalidateReviewer, invalidateFees,
  } = useAdminStore();

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isAdmin = session?.user?.role === 'ADMIN' || isSuperAdmin;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !isAdmin) {
      router.replace('/auth/login');
    }
  }, [router, session, status, isAdmin]);

  useEffect(() => {
    setActiveSite(getAdminSiteSlug());
  }, []);

  const handleSiteChange = (slug: string) => {
    setActiveSite(slug);
    setAdminSiteSlug(slug);
    invalidateStats(); invalidateUsers(); invalidatePapers(); invalidateConferences();
    invalidateEbooks(); invalidateCertificates(); invalidateJournals(); invalidateTeamMembers();
    invalidateEditorial(); invalidateArchives(); invalidateAnalytics(); invalidateSettings();
    invalidateAdvisory(); invalidateReviewer(); invalidateFees();
    window.location.reload();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const [papersRes, usersRes, conferencesRes] = await Promise.all([
        adminFetch(`/api/admin/papers?search=${encodeURIComponent(query)}`),
        adminFetch(`/api/admin/users?search=${encodeURIComponent(query)}`),
        adminFetch(`/api/admin/conferences?search=${encodeURIComponent(query)}`),
      ]);
      const results: SearchResult[] = [];
      if (papersRes.ok) {
        const papers = await papersRes.json();
        results.push(...(papers.papers || []).slice(0, 3).map((p: any) => ({ type: 'Paper' as const, ...p })));
      }
      if (usersRes.ok) {
        const users = await usersRes.json();
        results.push(...(users.users || []).slice(0, 3).map((u: any) => ({ type: 'User' as const, ...u })));
      }
      if (conferencesRes.ok) {
        const conferences = await conferencesRes.json();
        results.push(...(conferences.conferences || []).slice(0, 3).map((c: any) => ({ type: 'Conference' as const, ...c })));
      }
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getSearchResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'Paper': return `/admin/papers/${result.id}`;
      case 'User': return `/admin/users`;
      case 'Conference': return `/admin/conferences/${result.id}/edit`;
      default: return '/admin';
    }
  };

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

      {/* Admin Header — exact bar from dashboard + profile dropdown */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="min-w-0 flex-1 animate-fade-in-up">
                <button
                  className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mb-2"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="sr-only">Menu</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent sm:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-3 max-w-5xl text-base leading-7 text-gray-600 sm:text-lg">
                  Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name}</span>!
                  Here&apos;s what&apos;s happening in your system.
                </p>
              </div>

              <div className="flex w-full flex-col items-stretch gap-3 animate-fade-in-up animation-delay-200 lg:w-auto lg:flex-row lg:items-center">

                {/* Global Search */}
                <div className="relative flex-1 lg:w-80 xl:w-96">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search papers, users, conferences..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {searchResults.map((result, idx) => (
                          <Link
                            key={idx}
                            href={getSearchResultLink(result)}
                            onClick={() => setShowSearchResults(false)}
                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    result.type === 'Paper' ? 'bg-green-100 text-green-700' :
                                    result.type === 'User' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {result.type}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {result.title || result.name || result.email || result.firstName}
                                  </span>
                                </div>
                                {result.authors && (
                                  <p className="text-xs text-gray-500 mt-1">{result.authors}</p>
                                )}
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 p-2">
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isSuperAdmin && (
                    <div className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
                      <Globe className="h-4 w-4 text-cyan-600" />
                      <label className="flex items-center gap-2">
                        <span className="font-medium text-slate-500">Site</span>
                        <select
                          value={activeSite}
                          onChange={(event) => handleSiteChange(event.target.value)}
                          className="bg-transparent font-semibold text-slate-950 outline-none"
                          aria-label="Active site"
                        >
                          {ALL_SITES.map((site) => (
                            <option key={site.slug} value={site.slug}>
                              {site.shortName}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  {/* Profile Dropdown — Settings + Logout */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(session.user.firstName || session.user.email || 'A')[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{session.user.firstName || session.user.email}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {session.user.role}
                      </span>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                        <Link
                          href="/admin/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                        >
                          <Settings className="h-4 w-4 text-gray-500" />
                          Settings
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: '/auth/login' })}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer matches header height */}
      <div className="h-36" />

      <div className="flex">
        <AdminSidebar className="sticky top-36 hidden h-[calc(100vh-9rem)] self-start lg:block" />

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <AdminSidebar
              mobile
              onClose={() => setSidebarOpen(false)}
              className="fixed left-0 top-36 z-50 h-[calc(100vh-9rem)] overflow-y-auto"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <main>{children}</main>
        </div>
      </div>

    </div>
  );
}
