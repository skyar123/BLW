import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

export interface Family {
  id: string;
  name: string;
  members: string[];
  createdAt: Date;
}

export function useFamily() {
  const { user } = useAuth();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      setFamilyId(null);
      setFamily(null);
      return;
    }

    const fetchOrCreateFamily = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find the family where the user's email is listed in 'members'
        const q = query(
          collection(db, 'families'),
          where('members', 'array-contains', user.email)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Family exists, load it
          const familyDoc = snapshot.docs[0];
          setFamilyId(familyDoc.id);
          setFamily({
            id: familyDoc.id,
            ...familyDoc.data(),
          } as Family);
        } else {
          // No family found? Create a new one automatically
          const newFamilyRef = await addDoc(collection(db, 'families'), {
            name: `${user.displayName || user.email}'s Family`,
            members: [user.email],
            createdAt: serverTimestamp(),
          });

          setFamilyId(newFamilyRef.id);
          setFamily({
            id: newFamilyRef.id,
            name: `${user.displayName || user.email}'s Family`,
            members: [user.email!],
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error('Error fetching/creating family:', err);
        setError('Failed to load family data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateFamily();
  }, [user]);

  // Listen to family changes in real-time
  useEffect(() => {
    if (!familyId) return;

    const familyRef = doc(db, 'families', familyId);
    const unsubscribe = onSnapshot(familyRef, (snapshot) => {
      if (snapshot.exists()) {
        setFamily({
          id: snapshot.id,
          ...snapshot.data(),
        } as Family);
      }
    });

    return () => unsubscribe();
  }, [familyId]);

  // Function to invite a partner/family member
  const inviteMember = useCallback(
    async (email: string) => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (family?.members.includes(normalizedEmail)) {
        throw new Error('This person is already a family member');
      }

      const familyRef = doc(db, 'families', familyId);
      await updateDoc(familyRef, {
        members: arrayUnion(normalizedEmail),
      });
    },
    [familyId, family]
  );

  // Function to update family name
  const updateFamilyName = useCallback(
    async (newName: string) => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const familyRef = doc(db, 'families', familyId);
      await updateDoc(familyRef, { name: newName });
    },
    [familyId]
  );

  return {
    familyId,
    family,
    loading,
    error,
    inviteMember,
    updateFamilyName,
  };
}
