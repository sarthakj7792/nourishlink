'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartHandshake, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  Users, 
  Info,
  Calendar
} from 'lucide-react';

interface FoodBank {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface AidRequest {
  id: string;
  householdSize: number;
  urgency: string;
  status: string;
  dietaryRequirements: string;
  specialNotes?: string;
  createdAt: string;
  foodBank?: { name: string } | null;
}

export default function RecipientDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [urgency, setUrgency] = useState('MEDIUM');
  const [foodBankId, setFoodBankId] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableDietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Halal-Friendly',
    'Diabetic-Friendly',
    'Nut-Free',
    'Dairy-Free',
    'Infant Formula Needed',
  ];

  // Declared before useEffect to satisfy the variable-before-use rule
  const loadData = async () => {
    try {
      const [resReq, resBanks] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/food-banks'),
      ]);

      if (resReq.status === 401) {
        router.push('/login');
        return;
      }

      if (resReq.ok) {
        const d = await resReq.json();
        setRequests(d.requests || []);
      }

      if (resBanks.ok) {
        const b = await resBanks.json();
        setFoodBanks(b.foodBanks || []);
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

  const toggleDietary = (item: string) => {
    if (dietaryRequirements.includes(item)) {
      setDietaryRequirements(dietaryRequirements.filter((d) => d !== item));
    } else {
      setDietaryRequirements([...dietaryRequirements, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdSize: Number(householdSize),
          dietaryRequirements,
          urgency,
          foodBankId: foodBankId || undefined,
          specialNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setShowModal(false);
      setSpecialNotes('');
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this assistance request?')) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Confidential Food Assistance Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Submit confidential grocery requests specifying household size, medical dietary restrictions, and emergency level.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white text-sm shadow-md transition-all flex items-center gap-2 high-contrast-invert"
        >
          <PlusCircle className="w-4 h-4" />
          Request Food Parcel
        </button>
      </div>

      {/* Dignity and Privacy Notice */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 dark:text-sky-300 leading-relaxed">
          <strong className="block font-bold mb-0.5">Discreet & Respectful Service:</strong>
          All recipient requests and addresses are securely stored in compliance with privacy regulations. Our partner food pantries fulfill requests with pre-packaged dignity boxes aligned to your dietary profile.
        </div>
      </div>

      {/* Requests Board */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <HeartHandshake className="w-12 h-12 text-sky-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No active assistance requests</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Need support with fresh groceries or meals this week? Submit a request and our network pantries will assist.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
          >
            Create Food Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => {
            const dietary: string[] = JSON.parse(req.dietaryRequirements || '[]');
            return (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      <Users className="w-3.5 h-3.5" />
                      Family of {req.householdSize}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      req.urgency === 'EMERGENCY'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : req.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {req.urgency} Priority
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Assigned Food Bank:</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {req.foodBank?.name || 'Nearest Available Hub'}
                    </span>
                  </div>

                  {/* Dietary Requirements Chips */}
                  {dietary.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-500">Dietary Specifications:</span>
                      <div className="flex flex-wrap gap-1">
                        {dietary.map((d) => (
                          <span
                            key={d}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.specialNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      &quot;{req.specialNotes}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      req.status === 'FULFILLED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'MATCHED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>

                    {req.status === 'PENDING' && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Cancel Request"
                        aria-label="Cancel request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-sky-600" />
                Submit Food Assistance Request
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Household Size (People)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Urgency Tier
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="LOW">Low (Next Week)</option>
                    <option value="MEDIUM">Medium (Within 3 Days)</option>
                    <option value="HIGH">High (Within 24-48 Hours)</option>
                    <option value="EMERGENCY">Emergency (Immediate / Today)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Preferred Pantry Hub
                </label>
                <select
                  value={foodBankId}
                  onChange={(e) => setFoodBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="">-- Nearest Partner Food Bank --</option>
                  {foodBanks.map((fb) => (
                    <option key={fb.id} value={fb.id}>
                      {fb.name} ({fb.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Preferences Checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dietary Restrictions & Medical Needs
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDietaryOptions.map((opt) => {
                    const checked = dietaryRequirements.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleDietary(opt)}
                        className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                          checked
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '} {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Additional Notes (Mobility constraints, delivery vs pickup, etc.)
                </label>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Senior citizen living on 2nd floor, need evening pickup window."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md high-contrast-invert"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
