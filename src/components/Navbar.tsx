'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sun, 
  Moon, 
  Eye, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  PlusCircle, 
  FileText, 
  ShieldCheck
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { contrast, toggleContrast, theme, toggleTheme, fontSize, setFontSize } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check current session
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  return (
    <>
      {/* Accessible Skip Link for Screen Readers and Keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only-focusable z-50 bg-emerald-700 text-white p-3 font-semibold fixed top-2 left-2 rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl tracking-tight focus:ring-2 focus:ring-emerald-500 rounded p-1"
                aria-label="NourishLink Home"
              >
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span>Nourish<span className="text-slate-800 dark:text-slate-100">Link</span></span>
              </Link>
              
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800">
                Food Bank Network
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              <Link
                href="/donations"
                className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  pathname === '/donations' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Browse Food
              </Link>
              <Link
                href="/food-banks"
                className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  pathname === '/food-banks' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Food Banks
              </Link>

              {user?.role === 'DONOR' && (
                <Link
                  href="/donor"
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                    pathname.startsWith('/donor') ? 'text-emerald-600 font-bold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Donor Portal
                </Link>
              )}

              {user?.role === 'RECIPIENT' && (
                <Link
                  href="/recipient"
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                    pathname.startsWith('/recipient') ? 'text-emerald-600 font-bold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Requests
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pantry Operations
                </Link>
              )}
            </nav>

            {/* Accessibility Controls & Auth State */}
            <div className="flex items-center gap-2">
              
              {/* High Contrast Mode Toggle */}
              <button
                onClick={toggleContrast}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all focus:ring-2 focus:ring-amber-500 ${
                  contrast === 'high'
                    ? 'bg-yellow-400 text-black border-yellow-500 shadow-md font-extrabold ring-2 ring-yellow-400'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
                title="Toggle High Contrast Mode (WCAG AAA)"
                aria-pressed={contrast === 'high'}
                aria-label={`Toggle high contrast mode. Currently ${contrast === 'high' ? 'enabled' : 'disabled'}`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">High Contrast</span>
              </button>

              {/* Text Size Scale Toggle */}
              <button
                onClick={cycleFontSize}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                title="Cycle Text Scaling (A / A+ / A++)"
                aria-label={`Cycle text size. Currently ${fontSize}`}
              >
                {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
              </button>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                title="Toggle Dark / Light Theme"
                aria-label={`Toggle theme. Current theme is ${theme}`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {user.name.split(' ')[0]} ({user.role})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Sign Out"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                    >
                      Join Network
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Hamburger */}
              <div className="flex md:hidden ml-1">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Open mobile navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
            <Link
              href="/donations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Browse Food Donations
            </Link>
            <Link
              href="/food-banks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Partner Food Banks
            </Link>
            {user?.role === 'DONOR' && (
              <Link
                href="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                Donor Portal
              </Link>
            )}
            {user?.role === 'RECIPIENT' && (
              <Link
                href="/recipient"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                My Food Requests
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                Pantry Operations & Matching
              </Link>
            )}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
