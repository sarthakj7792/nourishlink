'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Building
} from 'lucide-react';

interface Donation {
  id: string;
  title: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  perishableDate: string;
  storageReq: string;
  status: string;
  aiUrgencyScore: number;
  aiTriageNotes?: string;
  dietaryTags: string;
  pickupAddress?: string;
  imageUrl?: string;
  donor: {
    id: string;
    name: string;
    city?: string;
    phone?: string;
  };
  foodBank?: {
    id: string;
    name: string;
  };
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/donations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const filteredDonations = donations.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.donor?.name && item.donor.name.toLowerCase().includes(term))
    );
  });

  const getUrgencyBadge = (score: number) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200">
          <Clock className="w-3 h-3" /> Urgent ({score}/100)
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
          <Clock className="w-3 h-3" /> Moderate ({score}/100)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
        <CheckCircle className="w-3 h-3" /> Stable ({score}/100)
      </span>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Available Surplus Food Listings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time surplus batches contributed by generous donors, evaluated with AI perishability analysis.
          </p>
        </div>

        <Link
          href="/donor"
          className="px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition-colors high-contrast-invert"
        >
          + Donate Food Batch
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search produce, bakery, canned items, or donor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Search donations"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Category selector */}
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            <option value="PRODUCE">Produce</option>
            <option value="BAKERY">Bakery</option>
            <option value="DAIRY">Dairy</option>
            <option value="CANNED">Canned & Dry</option>
            <option value="PREPARED">Prepared Meals</option>
            <option value="BEVERAGES">Beverages</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="DISTRIBUTED">Distributed</option>
          </select>
        </div>

      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-medium">Loading surplus listings...</div>
      ) : filteredDonations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No food donations found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or register a new batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => {
            const tags: string[] = JSON.parse(donation.dietaryTags || '[]');
            const expiry = new Date(donation.perishableDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={donation.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Card Image Banner */}
                  {donation.imageUrl ? (
                    <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={donation.imageUrl}
                        alt={donation.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                        {donation.status}
                      </span>
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-emerald-50 dark:bg-emerald-950/40 p-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {donation.category}
                      </span>
                      <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
                        {donation.status}
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {donation.category} • {donation.storageReq}
                      </span>
                      {getUrgencyBadge(donation.aiUrgencyScore)}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {donation.title}
                    </h2>

                    {donation.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {donation.description}
                      </p>
                    )}

                    {/* Quantity & Expiry */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block font-medium">Batch Size</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {donation.quantity} {donation.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Best-By / Expiry</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {expiry}
                        </span>
                      </div>
                    </div>

                    {/* AI Triage Snippet */}
                    {donation.aiTriageNotes && (
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="leading-snug">{donation.aiTriageNotes}</span>
                      </div>
                    )}

                    {/* Dietary Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{donation.donor?.name || 'Local Donor'}</span>
                  </div>
                  {donation.pickupAddress && (
                    <div className="flex items-center gap-1 truncate max-w-[45%]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{donation.pickupAddress}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
