'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Package,
  Layers
} from 'lucide-react';

interface DonorInfo {
  id: string;
  name: string;
  city?: string;
  phone?: string;
}

interface AdminDonation {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  perishableDate: string;
  storageReq: string;
  status: string;
  aiUrgencyScore: number;
  donor?: DonorInfo;
}

interface AdminRecipientRequest {
  id: string;
  householdSize: number;
  urgency: string;
  status: string;
  recipient?: {
    id: string;
    name: string;
  };
}

interface AiRecommendation {
  requestId: string;
  recipientName: string;
  matchScore: number;
  reasons: string[];
}

interface AiMatchResult {
  donationId: string;
  donationTitle: string;
  totalPendingRequests: number;
  recommendations: AiRecommendation[];
}

export default function PantryAdminPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [requests, setRequests] = useState<AdminRecipientRequest[]>([]);
  const [, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<AdminDonation | null>(null);
  const [aiMatches, setAiMatches] = useState<AiMatchResult | null>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [fulfillmentSuccess, setFulfillmentSuccess] = useState<string | null>(null);
  const [fulfillmentError, setFulfillmentError] = useState<string | null>(null);

  // Declared before useEffect to avoid variable-before-use lint error
  const loadData = async () => {
    try {
      const [resD, resR] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/requests'),
      ]);

      if (resD.status === 401 || resR.status === 401) {
        router.push('/login');
        return;
      }

      if (resD.ok) {
        const d = await resD.json();
        setDonations(d.donations || []);
      }

      if (resR.ok) {
        const r = await resR.json();
        setRequests(r.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunAiMatching = async (donation: AdminDonation) => {
    setSelectedDonation(donation);
    setMatchingLoading(true);
    setAiMatches(null);
    setFulfillmentSuccess(null);

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: donation.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiMatches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleFulfillMatch = async (requestId: string, donationId: string) => {
    setFulfillmentSuccess(null);
    setFulfillmentError(null);
    try {
      // 1. Mark request fulfilled
      const resReq = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FULFILLED', matchedDonationId: donationId }),
      });

      if (!resReq.ok) {
        const errData = await resReq.json();
        throw new Error(errData.error || 'Failed to update recipient request');
      }

      // 2. Mark donation distributed
      const resDon = await fetch(`/api/donations/${donationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISTRIBUTED' }),
      });

      if (!resDon.ok) {
        const errData = await resDon.json();
        throw new Error(errData.error || 'Failed to update donation status');
      }

      setFulfillmentSuccess(`Successfully matched and allocated food parcel!`);
      loadData();
    } catch (err: unknown) {
      console.error(err);
      setFulfillmentError(err instanceof Error ? err.message : 'Fulfillment failed. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pantry Director & Logistics Operator View
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Operations & Allocation Dispatch
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Intelligently match perishable donations against recipient dietary profiles using our multi-factor scoring model.
          </p>
        </div>
      </div>

      {fulfillmentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{fulfillmentSuccess}</span>
        </div>
      )}

      {fulfillmentError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{fulfillmentError}</span>
        </div>
      )}

      {/* Main Split Grid: Inventory vs Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Surplus Donations Inventory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Surplus Batches Awaiting Allocation ({donations.filter((d) => d.status === 'AVAILABLE').length})
            </h2>
            <span className="text-xs text-slate-500">Select item to match</span>
          </div>

          <div className="space-y-3">
            {donations
              .filter((d) => d.status === 'AVAILABLE')
              .map((donation) => {
                const isSelected = selectedDonation?.id === donation.id;
                return (
                  <div
                    key={donation.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-400">
                          {donation.category} • {donation.quantity} {donation.unit}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {donation.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Donor: {donation.donor?.name} ({donation.donor?.city || 'Local'})
                        </p>
                      </div>

                      <button
                        onClick={() => handleRunAiMatching(donation)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 transition-all high-contrast-invert"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto Match
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Expires: {new Date(donation.perishableDate).toLocaleDateString()}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        donation.aiUrgencyScore >= 70 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Urgency: {donation.aiUrgencyScore}/100
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: AI Triage & Match Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Algorithmic Match Engine
              </h2>
            </div>

            {selectedDonation ? (
              <div className="space-y-4">
                
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block">
                    Evaluating Batch: {selectedDonation.title}
                  </span>
                  <p className="text-purple-700 dark:text-purple-300">
                    Category: {selectedDonation.category} | Storage: {selectedDonation.storageReq}
                  </p>
                </div>

                {matchingLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Computing dietary compatibility and household urgency scores...
                  </div>
                ) : aiMatches && aiMatches.recommendations && aiMatches.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recommended Matches by Score
                    </p>
                    {aiMatches.recommendations.map((rec: AiRecommendation) => (
                      <div
                        key={rec.requestId}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {rec.recipientName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            {rec.matchScore}% Match
                          </span>
                        </div>

                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                          {rec.reasons.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleFulfillMatch(rec.requestId, selectedDonation.id)}
                          className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm high-contrast-invert"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirm & Allocate to {rec.recipientName}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No waiting requests match this batch.
                  </p>
                )}

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs">
                  Select a food donation from the left to compute optimal recipient compatibility.
                </p>
              </div>
            )}

          </div>

          {/* Pending Recipient Requests Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-500" />
              Active Waiting Recipient Queue ({requests.filter((r) => r.status === 'PENDING').length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {requests
                .filter((r) => r.status === 'PENDING')
                .slice(0, 5)
                .map((req) => (
                  <div key={req.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {req.recipient?.name || 'Anonymous'} (Family of {req.householdSize})
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Priority: {req.urgency}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
