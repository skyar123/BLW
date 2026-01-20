import { useState, useEffect } from 'react';
import { Button, Card } from '../ui';
import { useBabiesFirestore } from '../../hooks/useBabiesFirestore';
import type { Baby } from '../../types';

interface EditBabyModalProps {
  baby: Baby;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBabyModal({ baby, isOpen, onClose }: EditBabyModalProps) {
  const { updateBaby } = useBabiesFirestore();
  const [name, setName] = useState(baby.name);
  const [birthDate, setBirthDate] = useState(baby.birthDate);
  const [dueDate, setDueDate] = useState(baby.dueDate || '');
  const [gestationalWeeks, setGestationalWeeks] = useState(baby.gestationalWeeks?.toString() || '');
  const [notes, setNotes] = useState(baby.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when baby changes
  useEffect(() => {
    setName(baby.name);
    setBirthDate(baby.birthDate);
    setDueDate(baby.dueDate || '');
    setGestationalWeeks(baby.gestationalWeeks?.toString() || '');
    setNotes(baby.notes || '');
    setError(null);
  }, [baby]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await updateBaby({
        id: baby.id,
        name: name.trim(),
        birthDate,
        dueDate: dueDate || undefined,
        gestationalWeeks: gestationalWeeks ? parseInt(gestationalWeeks) : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update baby:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-charcoal dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-charcoal dark:text-white
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                       transition-colors"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-charcoal dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                       transition-colors"
            />
          </div>

          {/* Due Date (for premature babies) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Original Due Date <span className="text-gray-400 font-normal">(for corrected age)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-charcoal dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                       transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty if not premature
            </p>
          </div>

          {/* Gestational Weeks */}
          {dueDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gestational Weeks at Birth
              </label>
              <input
                type="number"
                value={gestationalWeeks}
                onChange={(e) => setGestationalWeeks(e.target.value)}
                min="20"
                max="42"
                placeholder="e.g., 34"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-charcoal dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                         transition-colors"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special notes about your little one..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-charcoal dark:text-white
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                       transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
