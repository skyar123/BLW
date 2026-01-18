import { useState, type FormEvent } from 'react';
import { Button, Input, Card } from '../ui';
import type { Baby } from '../../types';
import type { AddBabyInput } from '../../hooks/useBabies';

interface BabyFormProps {
  baby?: Baby;
  onSubmit: (data: AddBabyInput) => void;
  onCancel?: () => void;
}

export function BabyForm({ baby, onSubmit, onCancel }: BabyFormProps) {
  const [name, setName] = useState(baby?.name || '');
  const [birthDate, setBirthDate] = useState(baby?.birthDate || '');
  const [dueDate, setDueDate] = useState(baby?.dueDate || '');
  const [gestationalWeeks, setGestationalWeeks] = useState<string>(
    baby?.gestationalWeeks?.toString() || ''
  );
  const [notes, setNotes] = useState(baby?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    if (gestationalWeeks && (parseInt(gestationalWeeks) < 20 || parseInt(gestationalWeeks) > 42)) {
      newErrors.gestationalWeeks = 'Gestational weeks should be between 20 and 42';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      birthDate,
      dueDate: dueDate || undefined,
      gestationalWeeks: gestationalWeeks ? parseInt(gestationalWeeks) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const isEditing = !!baby;

  return (
    <Card variant="elevated" padding="lg" className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-charcoal">
            {isEditing ? 'Edit Baby Profile' : 'Add Your Baby'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isEditing
              ? 'Update your baby\'s information'
              : 'Tell us about your little one'}
          </p>
        </div>

        <Input
          label="Baby's Name"
          placeholder="Scout"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Input
          label="Birth Date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errors.birthDate}
        />

        <div className="border-t border-sage-100 pt-5">
          <p className="text-sm text-gray-500 mb-4">
            For premature babies, add the due date to calculate corrected age
          </p>

          <Input
            label="Original Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            hint="Leave blank if baby was born full-term"
          />
        </div>

        {dueDate && (
          <Input
            label="Gestational Weeks at Birth"
            type="number"
            placeholder="29"
            min={20}
            max={42}
            value={gestationalWeeks}
            onChange={(e) => setGestationalWeeks(e.target.value)}
            error={errors.gestationalWeeks}
            hint="Weeks of pregnancy when baby was born"
          />
        )}

        <div className="pt-2">
          <label className="block text-sm font-medium text-charcoal mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any sensory considerations, medical notes, etc."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-sage-200
                     bg-white text-charcoal placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                     transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" className="flex-1">
            {isEditing ? 'Save Changes' : 'Add Baby'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
