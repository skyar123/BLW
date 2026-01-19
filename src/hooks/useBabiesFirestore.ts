import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFamily } from './useFamily';
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

export function useBabiesFirestore() {
  const { familyId } = useFamily();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for babies collection
  useEffect(() => {
    if (!familyId) {
      setBabies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const babiesRef = collection(db, 'families', familyId, 'babies');
    const q = query(babiesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const babiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to ISO strings
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as Baby[];

        setBabies(babiesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching babies:', err);
        setError('Failed to load babies');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  const addBaby = useCallback(
    async (input: AddBabyInput): Promise<Baby> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const babiesRef = collection(db, 'families', familyId, 'babies');

      const babyData = {
        name: input.name,
        birthDate: input.birthDate,
        dueDate: input.dueDate || null,
        wasPremature: !!input.dueDate,
        gestationalWeeks: input.gestationalWeeks || null,
        notes: input.notes || null,
        photoUrl: input.photoUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(babiesRef, babyData);

      return {
        id: docRef.id,
        ...input,
        wasPremature: !!input.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Baby;
    },
    [familyId]
  );

  const updateBaby = useCallback(
    async (input: UpdateBabyInput): Promise<Baby | null> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const babyRef = doc(db, 'families', familyId, 'babies', input.id);

      const updateData: Record<string, unknown> = {
        ...input,
        updatedAt: serverTimestamp(),
      };

      // If dueDate is being updated, recalculate wasPremature
      if (input.dueDate !== undefined) {
        updateData.wasPremature = !!input.dueDate;
      }

      // Remove id from update data
      delete updateData.id;

      await updateDoc(babyRef, updateData);

      // Return the updated baby from local state
      const existingBaby = babies.find((b) => b.id === input.id);
      if (existingBaby) {
        return {
          ...existingBaby,
          ...input,
          wasPremature: input.dueDate !== undefined ? !!input.dueDate : existingBaby.wasPremature,
          updatedAt: new Date().toISOString(),
        };
      }
      return null;
    },
    [familyId, babies]
  );

  const deleteBaby = useCallback(
    async (id: string): Promise<boolean> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      try {
        const babyRef = doc(db, 'families', familyId, 'babies', id);
        await deleteDoc(babyRef);
        return true;
      } catch (err) {
        console.error('Error deleting baby:', err);
        return false;
      }
    },
    [familyId]
  );

  const getBabyById = useCallback(
    (id: string): Baby | undefined => {
      return babies.find((baby) => baby.id === id);
    },
    [babies]
  );

  return {
    babies,
    loading,
    error,
    addBaby,
    updateBaby,
    deleteBaby,
    getBabyById,
    hasBabies: babies.length > 0,
  };
}
