'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Search,
  User,
  LogOut,
  Settings,
  Library,
  Users,
  Info,
  BookOpen,
  FileText
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    {
      label: 'Research',
      id: 'research',
      items: [
        { href: '/library', label: 'Library' },
        { href: '/issues', label: 'Issues' },
        { href: '/conferences', label: 'Conferences' },
        { href: '/ebooks', label: 'Ebooks' },
      ]
    },
    {
      label: 'Boards',
      id: 'boards',
      items: [
        { href: '/editorial-board', label: 'Editorial Board' },
        { href: '/advisory-board', label: 'Advisory Board' },
        { href: '/reviewer-board', label: 'Reviewer Board' },
      ]
    },
    {
      label: 'About',
      id: 'about',
      items: [
        { href: '/about', label: 'About WJIIS' },
        { href: '/submission-guidelines', label: 'Submission Guidelines' },
        { href: '/peer-review-process', label: 'Peer Review Process' },
        { href: '/contact', label: 'Contact Us' },
      ]
    }
  ];

  return (
    <>
      <nav ref={navRef} className="fixed top-0 w-full z-50 shadow-sm font-sans" style={{background: '#ffffff', borderBottom: '1px solid #b2dde6'}}>
        {/* Top Bar */}
        <div className="text-xs py-1.5 px-4 hidden sm:block" style={{background: '#1a3a4a'}}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="text-white">ISSN: 3108-2211 (Online)</span>
            <div className="space-x-4">
              <Link href="/contact" className="text-white hover:text-white transition-colors">Contact</Link>
              <Link href="/support" className="text-white hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 rounded-md" style={{background: '#1a3a4a'}}>
                  <span className="font-bold text-xl tracking-wider text-white">WJ</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none text-black transition-colors">WJIIS</span>
                  <span className="text-[0.65rem] uppercase tracking-widest font-medium mt-1 text-black">Academic Journal</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-black hover:text-black transition-colors">Home</Link>

              {navLinks.map((link) => (
                <div key={link.id} className="relative group">
                  <button
                    className="flex items-center text-sm font-medium text-black transition-colors py-2"
                    onClick={() => setActiveDropdown(activeDropdown === link.id ? null : link.id)}
                  >
                    {link.label}
                    <ChevronDown className="ml-1 h-3 w-3 text-black" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 w-56 bg-white shadow-lg rounded-md py-2 transition-all duration-200 transform origin-top-left ${
                    activeDropdown === link.id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible'
                  }`} style={{border: '1px solid #b2dde6'}}>
                    {link.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-black hover:bg-slate-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <Link href="/tools" className="text-sm font-medium text-black hover:text-black transition-colors">Tools</Link>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-48 pl-3 pr-8 py-1.5 text-sm rounded-md focus:outline-none transition-all"
                      style={{border: '1px solid #1a6b7a', color: '#1a3a4a'}}
                      autoFocus
                      onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-2 top-1.5" style={{color: '#1a6b7a'}}>
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setIsSearchOpen(true)} className="text-black transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="h-4 w-px" style={{background: '#b2dde6'}}></div>

              {/* Auth */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm font-medium" style={{color: '#1a3a4a'}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{background: '#e8f6f8', color: '#1a6b7a', borderColor: '#b2dde6'}}>
                      {session.user.name?.charAt(0) || <User className="h-4 w-4" />}
                    </div>
                    <span className="max-w-[100px] truncate">{session.user.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-3 w-3" style={{color: '#1a6b7a'}} />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right" style={{border: '1px solid #b2dde6'}}>
                    <div className="px-4 py-2" style={{borderBottom: '1px solid #e8f6f8'}}>
                      <p className="text-xs font-semibold uppercase" style={{color: '#1a6b7a'}}>Signed in as</p>
                      <p className="text-sm font-medium truncate" style={{color: '#1a3a4a'}}>{session.user.email}</p>
                    </div>

                    <Link href="/profile" className="block px-4 py-2 text-sm transition-colors" style={{color: '#1a3a4a'}}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9fb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Profile
                    </Link>

                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm transition-colors" style={{color: '#1a3a4a'}}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9fb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/login" className="text-sm font-medium text-black transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="text-sm font-medium text-white px-4 py-2 rounded-md transition-colors shadow-sm" style={{background: '#e8622a'}}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{color: '#1a6b7a'}}>
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2" style={{color: '#1a3a4a'}}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white max-h-[calc(100vh-5rem)] overflow-y-auto" style={{borderTop: '1px solid #b2dde6'}}>
            <div className="px-4 py-2 space-y-1">
              <Link href="/" className="block py-2 text-base font-medium" style={{color: '#1a3a4a', borderBottom: '1px solid #e8f6f8'}}>Home</Link>
              {navLinks.map((group) => (
                <div key={group.id} className="py-2" style={{borderBottom: '1px solid #e8f6f8'}}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{color: '#1a6b7a'}}>{group.label}</div>
                  <div className="pl-4 space-y-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block text-sm transition-colors"
                        style={{color: '#1a3a4a'}}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="py-4 space-y-3">
                {!session ? (
                  <>
                    <Link href="/auth/login" className="block w-full text-center px-4 py-2 rounded-md font-medium" style={{border: '1px solid #1a6b7a', color: '#1a6b7a'}}>Sign In</Link>
                    <Link href="/auth/register" className="block w-full text-center px-4 py-2 rounded-md text-white font-medium" style={{background: '#e8622a'}}>Sign Up</Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="block text-sm font-medium" style={{color: '#1a3a4a'}}>My Profile</Link>
                    <button onClick={() => signOut()} className="block text-sm font-medium text-red-600">Sign Out</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-20 sm:h-[6.75rem]"></div>
    </>
  );
};

export default Navbar;
