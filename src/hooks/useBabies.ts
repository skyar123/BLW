import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';
import type { Baby } from '../types';

export interface AddBabyInput {
  name: string;
  birthDate: string;
  dueDate?: string;
  gestationalWeeks?: number;
  notes?: string;
  photoUrl?: string;
}

export interface UpdateBabyInput extends Partial<AddBabyInput> {
  id: string;
}

export function useBabies() {
  const [babies, setBabies] = useLocalStorage<Baby[]>(STORAGE_KEYS.BABIES, []);

  const addBaby = useCallback(
    (input: AddBabyInput): Baby => {
      const now = new Date().toISOString();
      const newBaby: Baby = {
        id: uuidv4(),
        name: input.name,
        birthDate: input.birthDate,
        dueDate: input.dueDate,
        wasPremature: !!input.dueDate, // If due date is provided, assume premature
        gestationalWeeks: input.gestationalWeeks,
        notes: input.notes,
        photoUrl: input.photoUrl,
        createdAt: now,
        updatedAt: now,
      };

      setBabies((prev) => [...prev, newBaby]);
      return newBaby;
    },
    [setBabies]
  );

  const updateBaby = useCallback(
    (input: UpdateBabyInput): Baby | null => {
      let updatedBaby: Baby | null = null;

      setBabies((prev) =>
        prev.map((baby) => {
          if (baby.id === input.id) {
            updatedBaby = {
              ...baby,
              ...input,
              wasPremature: input.dueDate !== undefined ? !!input.dueDate : baby.wasPremature,
              updatedAt: new Date().toISOString(),
            };
            return updatedBaby;
          }
          return baby;
        })
      );

      return updatedBaby;
    },
    [setBabies]
  );

  const deleteBaby = useCallback(
    (id: string): boolean => {
      let deleted = false;
      setBabies((prev) => {
        const filtered = prev.filter((baby) => baby.id !== id);
        deleted = filtered.length < prev.length;
        return filtered;
      });
      return deleted;
    },
    [setBabies]
  );

  const getBabyById = useCallback(
    (id: string): Baby | undefined => {
      return babies.find((baby) => baby.id === id);
    },
    [babies]
  );

  return {
    babies,
    addBaby,
    updateBaby,
    deleteBaby,
    getBabyById,
    hasBabies: babies.length > 0,
  };
}
