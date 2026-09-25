'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Package, 
  Users, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface FoodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  contactPhone?: string;
  contactEmail?: string;
  capacityKg: number;
  currentStockKg: number;
  operatingHours?: string;
  _count?: {
    donations: number;
    requests: number;
  };
}

export default function FoodBanksPage() {
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/food-banks')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.foodBanks) setFoodBanks(data.foodBanks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Partner Food Banks & Community Pantries
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Certified distribution centers equipped with cold storage, accessible ramp access, and dignified parcel pickup.
          </p>
        </div>

        <Link
          href="/recipient"
          className="px-4 py-2.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white text-sm shadow-md transition-colors high-contrast-invert"
        >
          Request Food at a Pantry
        </Link>
      </div>

      {/* Food Banks Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading partner food banks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {foodBanks.map((bank) => {
            const stockPct = Math.round((bank.currentStockKg / bank.capacityKg) * 100);

            return (
              <div
                key={bank.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{bank.name}</h2>
                        <span className="text-xs text-slate-500">{bank.city}, ZIP {bank.zipCode}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" /> Certified
                    </span>
                  </div>

                  {/* Stock Level Capacity Meter */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Current Stock Fill</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {bank.currentStockKg} / {bank.capacityKg} kg ({stockPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, stockPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{bank.address}</span>
                    </div>
                    {bank.operatingHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{bank.operatingHours}</span>
                      </div>
                    )}
                    {bank.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{bank.contactPhone}</span>
                      </div>
                    )}
                    {bank.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{bank.contactEmail}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Activity Metrics */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-emerald-500" />
                      {bank._count?.donations || 0} batches received
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-500" />
                      {bank._count?.requests || 0} active claims
                    </span>
                  </div>

                  <Link
                    href="/donor"
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Donate to Hub <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
