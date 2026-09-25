'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, Building, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DONOR',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      if (formData.role === 'DONOR') router.push('/donor');
      else if (formData.role === 'RECIPIENT') router.push('/recipient');
      else router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Join NourishLink</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign up to donate food, seek family assistance, or manage pantry distribution.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              I am participating as a:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'DONOR', label: 'Food Donor' },
                { role: 'RECIPIENT', label: 'Recipient' },
                { role: 'ADMIN', label: 'Food Bank Staff' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.role}
                  onClick={() => setFormData({ ...formData, role: item.role })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.role === item.role
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Full Name or Business Entity
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.role === 'DONOR' ? 'e.g. Green Valley Grocers' : 'e.g. Maria Gonzalez'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="city" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                City / Borough
              </label>
              <div className="relative">
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Downtown"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 high-contrast-invert mt-2"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
