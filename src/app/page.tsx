'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  ArrowRight, 
  TrendingUp, 
  Leaf, 
  Users, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
} from 'lucide-react';

interface Stats {
  totalDonationsCount: number;
  availableDonationsCount: number;
  totalRequestsCount: number;
  foodBanksCount: number;
  totalKgSaved: number;
  co2OffsetKg: number;
  mealsDistributed: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-8 md:p-14 shadow-2xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Optimized Community Food Logistics
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Connecting surplus food to <span className="text-emerald-400 underline decoration-emerald-500/50">empty tables</span> with dignity.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            NourishLink unites supermarkets, bakeries, community pantries, and families in need. 
            Features real-time expiry triage, automated dietary matching, and WCAG AAA high-contrast accessibility for everyone.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/donations"
              className="px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 text-sm sm:text-base high-contrast-invert"
            >
              Browse Surplus Food
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/donor"
              className="px-6 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all text-sm sm:text-base flex items-center gap-2"
            >
              Donate Surplus Items
            </Link>

            <Link
              href="/recipient"
              className="px-6 py-3.5 rounded-xl font-bold bg-teal-800/60 hover:bg-teal-700/60 text-teal-100 border border-teal-600/40 transition-all text-sm sm:text-base"
            >
              Request Assistance
            </Link>
          </div>

        </div>

        {/* Decorative background blur ring */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Live Impact Counters */}
      <section aria-labelledby="impact-heading">
        <h2 id="impact-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Live Network Impact Dashboard
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Food Saved</span>
              <Leaf className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : `${stats?.totalKgSaved.toLocaleString() || 0} kg`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Diverted from landfill waste</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
              <span className="text-xs font-bold uppercase tracking-wider">Meals Provided</span>
              <HeartHandshake className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : stats?.mealsDistributed.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nutritious meal equivalents</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">CO₂ Footprint Offset</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : `${stats?.co2OffsetKg.toLocaleString() || 0} kg`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Emissions prevented</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Pantries</span>
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : stats?.foodBanksCount || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Partner distribution hubs</p>
          </div>

        </div>
      </section>

      {/* Role Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Donor Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Donors & Businesses</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Post excess inventory, bakery goods, or fresh harvest batches in seconds. Receive instant shelf-life ratings and coordinate secure pickups.
            </p>
          </div>
          <Link
            href="/donor"
            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:gap-2.5 transition-all pt-2"
          >
            Access Donor Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recipient Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-500 transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Community Members</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Request discrete food parcels tailored to your family size and medical/dietary requirements (Diabetic, Halal, Gluten-Free, Vegan).
            </p>
          </div>
          <Link
            href="/recipient"
            className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 hover:gap-2.5 transition-all pt-2"
          >
            Request Food Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Food Bank Admin Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500 transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Pantry Operators</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dispatch inventory efficiently with our automated matching engine. Match incoming perishable donations to waiting high-urgency recipients.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 hover:gap-2.5 transition-all pt-2"
          >
            Open Dispatch Center <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* Accessibility & Tech Excellence Highlights */}
      <section className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Built for Impact, Engineered with Precision</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>WCAG AAA Accessible</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed with a dedicated High Contrast Mode (yellow-on-black), dynamic font scaling, skip-links, and semantic ARIA labeling for visually impaired users.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>Security & Sensitive Data</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Role-Based Access Control (RBAC), bcrypt password hashing, HTTP-only secure cookie JWT sessions, and Zod input sanitization.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Perishability & Triage Engine</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates food degradation risk factoring storage conditions (ambient, chilled, frozen) and recommends priority dispatch channels.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
