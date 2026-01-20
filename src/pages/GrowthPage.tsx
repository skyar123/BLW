import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button, Card, Input } from '../components/ui';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import { useFamily } from '../hooks/useFamily';

interface GrowthEntry {
  id: string;
  babyId: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
  notes?: string;
  createdAt: string;
}

export function GrowthPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId?: string }>();
  const { babies } = useBabiesFirestore();
  const { familyId } = useFamily();

  const selectedBabyId = babyId || babies[0]?.id;
  const selectedBaby = babies.find((b) => b.id === selectedBabyId);

  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Load growth entries
  useEffect(() => {
    if (!familyId || !selectedBabyId) {
      setLoading(false);
      return;
    }

    const entriesRef = collection(db, 'families', familyId, 'growth');
    const q = query(entriesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as GrowthEntry))
        .filter((e) => e.babyId === selectedBabyId);
      setEntries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId, selectedBabyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !selectedBabyId) return;

    setSaving(true);
    try {
      const entriesRef = collection(db, 'families', familyId, 'growth');
      await addDoc(entriesRef, {
        babyId: selectedBabyId,
        date,
        weightKg: weight ? parseFloat(weight) : null,
        heightCm: height ? parseFloat(height) : null,
        headCm: head ? parseFloat(head) : null,
        notes: notes.trim() || null,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setWeight('');
      setHeight('');
      setHead('');
      setNotes('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save growth entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-charcoal dark:text-white">Growth Tracker</h1>
              {selectedBaby && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBaby.name}</p>
              )}
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              + Add
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Baby selector */}
        {babies.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => navigate(`/growth/${baby.id}`)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  baby.id === selectedBabyId
                    ? 'bg-sage-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {baby.name}
              </button>
            ))}
          </div>
        )}

        {/* Add Entry Form */}
        {showForm && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-4">
              Add Growth Entry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
                  placeholder="7.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  placeholder="68"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <Input
                  label="Head (cm)"
                  type="number"
                  step="0.1"
                  placeholder="43"
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Doctor visit, milestone, etc."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-charcoal dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Growth History */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-4xl animate-bounce">📊</div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="text-4xl mb-3">📏</div>
            <h3 className="font-semibold text-charcoal dark:text-white mb-2">
              No growth entries yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Track weight, height, and head circumference over time
            </p>
            <Button onClick={() => setShowForm(true)}>Add First Entry</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id} padding="md">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-charcoal dark:text-white">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {entry.weightKg && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Weight</span>
                      <p className="font-semibold text-charcoal dark:text-white">
                        {entry.weightKg} kg
                      </p>
                    </div>
                  )}
                  {entry.heightCm && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Height</span>
                      <p className="font-semibold text-charcoal dark:text-white">
                        {entry.heightCm} cm
                      </p>
                    </div>
                  )}
                  {entry.headCm && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Head</span>
                      <p className="font-semibold text-charcoal dark:text-white">
                        {entry.headCm} cm
                      </p>
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                    {entry.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
