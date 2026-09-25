'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Route based on role
      if (data.user.role === 'DONOR') {
        router.push('/donor');
      } else if (data.user.role === 'RECIPIENT') {
        router.push('/recipient');
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to NourishLink</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Access your food donations, assistance requests, or pantry dashboard.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Login Buttons for Reviewers */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('donor@freshharvest.com')}
              className="px-2 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('maria.recipient@gmail.com')}
              className="px-2 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-semibold"
            >
              Recipient
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@nourishlink.org')}
              className="px-2 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 high-contrast-invert"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create one now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
