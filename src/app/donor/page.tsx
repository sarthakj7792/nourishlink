'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Sparkles, 
  AlertCircle, 
  PackageCheck
} from 'lucide-react';

interface FoodBank {
  id: string;
  name: string;
  city: string;
}

interface FoodDonationItem {
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
  dietaryTags?: string;
  pickupAddress?: string;
  imageUrl?: string;
  foodBankId?: string;
  createdAt: string;
  foodBank?: {
    id: string;
    name: string;
  };
}

export default function DonorDashboardPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<FoodDonationItem[]>([]);
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<FoodDonationItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PRODUCE');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('KG');
  const [perishableDate, setPerishableDate] = useState(() => {
    const def = new Date();
    def.setDate(def.getDate() + 3);
    return def.toISOString().split('T')[0];
  });
  const [storageReq, setStorageReq] = useState('REFRIGERATED');
  const [foodBankId, setFoodBankId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dietaryInput, setDietaryInput] = useState('Vegetarian, Vegan');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Declared before useEffect to avoid variable-before-use lint error
  const loadData = async () => {
    try {
      const [resDonations, resBanks] = await Promise.all([
        fetch('/api/donations?donorOnly=true'),
        fetch('/api/food-banks'),
      ]);

      if (resDonations.status === 401 || resDonations.status === 403) {
        router.push('/login');
        return;
      }

      if (resDonations.ok) {
        const d = await resDonations.json();
        setDonations(d.donations || []);
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

  const handleOpenCreate = () => {
    setEditingDonation(null);
    setTitle('');
    setDescription('');
    setCategory('PRODUCE');
    setQuantity(10);
    setUnit('KG');
    setStorageReq('REFRIGERATED');
    setFoodBankId('');
    setPickupAddress('');
    setDietaryInput('Vegetarian, Vegan');
    setImageUrl('');
    // Reset expiry to a fresh 3-day default every time the Create modal opens
    const def = new Date();
    def.setDate(def.getDate() + 3);
    setPerishableDate(def.toISOString().split('T')[0]);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (donation: FoodDonationItem) => {
    setEditingDonation(donation);
    setTitle(donation.title);
    setDescription(donation.description || '');
    setCategory(donation.category);
    setQuantity(donation.quantity);
    setUnit(donation.unit);
    setPerishableDate(new Date(donation.perishableDate).toISOString().split('T')[0]);
    setStorageReq(donation.storageReq);
    setFoodBankId(donation.foodBankId || '');
    setPickupAddress(donation.pickupAddress || '');
    const tags = JSON.parse(donation.dietaryTags || '[]');
    setDietaryInput(tags.join(', '));
    setImageUrl(donation.imageUrl || '');
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const tagsArray = dietaryInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      description,
      category,
      quantity: Number(quantity),
      unit,
      perishableDate: new Date(perishableDate).toISOString(),
      storageReq,
      foodBankId: foodBankId || undefined,
      pickupAddress,
      dietaryTags: tagsArray,
      imageUrl: imageUrl || undefined,
    };

    try {
      let res;
      if (editingDonation) {
        res = await fetch(`/api/donations/${editingDonation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save donation');
      }

      setShowCreateModal(false);
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this donation batch?')) return;
    try {
      const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Donor Operations Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create surplus food listings, manage pickup schedules, and view AI-predicted perishability ratings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition-all flex items-center gap-2 high-contrast-invert"
        >
          <PlusCircle className="w-4 h-4" />
          List New Food Donation
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">My Active Listings</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {donations.filter((d) => d.status === 'AVAILABLE').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Reserved / Scheduled</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {donations.filter((d) => d.status === 'RESERVED').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Completed Distributions</span>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {donations.filter((d) => d.status === 'DISTRIBUTED').length}
          </p>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading your listings...</div>
      ) : donations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <PackageCheck className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">You have no active food batches</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Ready to reduce food waste? Post your extra produce, bread, or canned stock to support local families.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Create Your First Donation
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Donor Listings Table">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Urgency Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {donations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.category} • {item.storageReq}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.aiUrgencyScore >= 70
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : item.aiUrgencyScore >= 40
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {item.aiUrgencyScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        aria-label={`Update status for ${item.title}`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="DISTRIBUTED">DISTRIBUTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(item.perishableDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Donation"
                        aria-label="Edit donation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Donation"
                        aria-label="Delete donation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {editingDonation ? 'Edit Food Donation Batch' : 'List Surplus Food Donation'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
              
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Organic Mixed Apples & Pears"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="PRODUCE">Produce</option>
                    <option value="BAKERY">Bakery</option>
                    <option value="DAIRY">Dairy</option>
                    <option value="CANNED">Canned / Dry</option>
                    <option value="PREPARED">Prepared Meals</option>
                    <option value="BEVERAGES">Beverages</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Storage Requirement
                  </label>
                  <select
                    value={storageReq}
                    onChange={(e) => setStorageReq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="AMBIENT">Ambient (Room Temp)</option>
                    <option value="REFRIGERATED">Refrigerated</option>
                    <option value="FROZEN">Frozen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quantity & Units
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-2/3 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-1/3 px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    >
                      <option value="KG">KG</option>
                      <option value="LBS">LBS</option>
                      <option value="ITEMS">Items</option>
                      <option value="BOXES">Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Expiry / Best-By Date
                  </label>
                  <input
                    type="date"
                    required
                    value={perishableDate}
                    onChange={(e) => setPerishableDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Designated Partner Food Bank (Optional)
                </label>
                <select
                  value={foodBankId}
                  onChange={(e) => setFoodBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="">-- Open to Any Local Network Pantry --</option>
                  {foodBanks.map((fb) => (
                    <option key={fb.id} value={fb.id}>
                      {fb.name} ({fb.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dietary Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  placeholder="Vegetarian, Halal-Friendly, Gluten-Free, Diabetic-Friendly"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pickup Address / Dock Instructions
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. 100 Main St, Rear Loading Dock"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md high-contrast-invert"
                >
                  {submitting ? 'Analyzing & Saving...' : editingDonation ? 'Save Changes' : 'Publish Donation Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
