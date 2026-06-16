'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  Home,
  FileText,
  Archive,
  Users,
  Scale,
  Settings,
  GraduationCap,
  Eye,
  PenTool,
  BarChart3,
  Phone,
  Info,
  ChevronLeft,
  Send,
  Calendar,
  Library,
  Shield,
  Crown,
  Award,
  Sparkles,
  Zap,
  DollarSign,
  Wrench,
  Book
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { data: session } = useSession();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError('Invalid credentials');
      } else {
        setLoginForm({ email: '', password: '' });
      }
    } catch {
      setLoginError('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getNavigationSections = () => {
    const publicSections = [
      {
        title: 'Main',
        items: [
          { href: '/', label: 'Home', icon: Home },
          { href: '/about', label: 'About', icon: Info },
          { href: '/contact', label: 'Contact', icon: Phone },
        ]
      },
      {
        title: 'Research',
        items: [
          { href: '/library', label: 'Library', icon: Library },
          { href: '/issues', label: 'Issues', icon: Archive },
          { href: '/conferences', label: 'Conferences', icon: Calendar },
          { href: '/ebooks', label: 'Ebooks', icon: Book },
          { href: '/fees', label: 'Publication Fees', icon: DollarSign },
        ]
      },
      {
        title: 'Tools',
        items: [
          { href: '/tools', label: 'Tools', icon: Wrench },
        ]
      },
      {
        title: 'Information',
        items: [
          { href: '/editorial-board', label: 'Editorial Board', icon: Users },
          { href: '/advisory-board', label: 'Advisory Board', icon: Award },
          { href: '/reviewer-board', label: 'Reviewer Board', icon: Eye },
          { href: '/submission-guidelines', label: 'Guidelines', icon: FileText },
          { href: '/peer-review-process', label: 'Peer Review', icon: Scale },
        ]
      }
    ];

    if (!session) {
      return publicSections;
    }

    const authenticatedSections = [...publicSections];

    // Add role-specific sections
    if (session.user.role === 'ADMIN') {
      authenticatedSections.push({
        title: 'Admin',
        items: [
          { href: '/admin', label: 'Admin Dashboard', icon: Shield },
          { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/admin/users', label: 'User Management', icon: Users },
          { href: '/admin/papers', label: 'Paper Management', icon: FileText },
          { href: '/admin/chief-patrons', label: 'Chief Patrons', icon: Crown },
          { href: '/admin/impact-factors', label: 'Impact Factors', icon: Award },
          { href: '/admin/certificates/generate', label: 'Generate Certificates', icon: Award },
          { href: '/admin/animations', label: 'Festival Animations', icon: Sparkles },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ]
      });
    }

    if (session.user.role === 'STUDENT') {
      authenticatedSections.push({
        title: 'Student',
        items: [
          { href: '/student', label: 'Dashboard', icon: GraduationCap },
          { href: '/submit', label: 'Submit Paper', icon: Send },
          { href: '/dashboard/student', label: 'My Submissions', icon: FileText },
        ]
      });
    }

    if (session.user.role === 'AUTHOR') {
      authenticatedSections.push({
        title: 'Author',
        items: [
          { href: '/author', label: 'Dashboard', icon: PenTool },
          { href: '/submit', label: 'Submit Paper', icon: Send },
          { href: '/dashboard/author', label: 'My Papers', icon: FileText },
        ]
      });
    }

    if (session.user.role === 'REVIEWER') {
      authenticatedSections.push({
        title: 'Reviewer',
        items: [
          { href: '/reviewer', label: 'Dashboard', icon: Eye },
          { href: '/dashboard/reviewer', label: 'Review Queue', icon: FileText },
        ]
      });
    }

    return authenticatedSections;
  };

  const navigationSections = getNavigationSections();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-md z-40 lg:hidden transition-all duration-500 animate-fade-in"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-indigo-100/50 shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0 animate-slide-in-left' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-gradient">
                <Library className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            </div>
            <span className="font-bold text-xl text-gradient-animate">IJARCM</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-300 group hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!session ? (
            /* Quick Login Form */
            <div className="p-6 border-b border-blue-100/50 animate-slide-in-down">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 mb-5 border border-indigo-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-gray-800">Quick Login</h3>
                </div>
                <p className="text-xs text-gray-600">Access your account instantly</p>
              </div>
              <form onSubmit={handleQuickLogin} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-indigo-300"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">📧</div>
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-indigo-300"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">🔒</div>
                  </div>
                </div>
                {loginError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 animate-slide-in-down">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group overflow-hidden animate-gradient"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link
                  href="/auth/register"
                  className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-300 hover:underline font-medium"
                >
                  Don&apos;t have an account? Register
                </Link>
              </div>
            </div>
          ) : (
            /* User Info */
            <div className="p-6 border-b border-indigo-100/50 animate-slide-in-down">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg animate-gradient">
                      <span className="text-white font-bold text-xl">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {session.user.email}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="flex-1 p-4">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-2"></div>
                  {section.title}
                </h3>
                <nav className="space-y-2 stagger-children">
                  {section.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md hover:transform hover:scale-105 hover-lift"
                        onClick={() => {
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                      >
                        <div className="h-5 w-5 transition-all duration-300 text-gray-500 group-hover:text-indigo-500 group-hover:scale-110">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="relative z-10">{item.label}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl"></div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-indigo-100/50 bg-gradient-to-r from-gray-50/50 via-indigo-50/50 to-purple-50/50 animate-slide-in-up">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"></div>
              </div>
              <p className="text-xs text-gray-600 font-bold mb-1">
                © 2025 IJARCM
              </p>
              <p className="text-xs text-gray-500">
                All rights reserved
              </p>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
