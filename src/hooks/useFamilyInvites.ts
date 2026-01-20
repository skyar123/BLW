import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFamily } from './useFamily';
import { useAuth } from '../context/AuthContext';

export interface FamilyInvite {
  id: string;
  email: string;
  code: string;
  sentAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'cancelled';
  sentBy: string;
  resentCount: number;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useFamilyInvites() {
  const { familyId } = useFamily();
  const { user } = useAuth();
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for invites
  useEffect(() => {
    if (!familyId) {
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const invitesRef = collection(db, 'families', familyId, 'invites');
    const q = query(invitesRef, orderBy('sentAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const invitesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            code: data.code,
            sentAt: data.sentAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            expiresAt: data.expiresAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            status: data.status,
            sentBy: data.sentBy,
            resentCount: data.resentCount || 0,
          };
        }) as FamilyInvite[];

        setInvites(invitesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching invites:', err);
        setError('Failed to load invites');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  const sendInvite = useCallback(
    async (email: string): Promise<{ success: boolean; message: string }> => {
      if (!familyId || !user) {
        return { success: false, message: 'Not authenticated' };
      }

      // Check if email already has a pending invite
      const existingPending = invites.find(
        (i) => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending'
      );
      if (existingPending) {
        return { success: false, message: 'This email already has a pending invite' };
      }

      const invitesRef = collection(db, 'families', familyId, 'invites');
      const code = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const inviteData = {
        email: email.toLowerCase(),
        code,
        sentAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        status: 'pending',
        sentBy: user.uid,
        resentCount: 0,
      };

      try {
        await addDoc(invitesRef, inviteData);
        // In a real app, you'd send an email here via Firebase Functions or similar
        return {
          success: true,
          message: `Invite sent to ${email}. Share code: ${code}`,
        };
      } catch (err) {
        console.error('Error sending invite:', err);
        return { success: false, message: 'Failed to send invite' };
      }
    },
    [familyId, user, invites]
  );

  const resendInvite = useCallback(
    async (inviteId: string): Promise<{ success: boolean; message: string }> => {
      if (!familyId) {
        return { success: false, message: 'Not authenticated' };
      }

      const invite = invites.find((i) => i.id === inviteId);
      if (!invite) {
        return { success: false, message: 'Invite not found' };
      }

      const inviteRef = doc(db, 'families', familyId, 'invites', inviteId);
      const newCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      try {
        await updateDoc(inviteRef, {
          code: newCode,
          sentAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
          resentCount: (invite.resentCount || 0) + 1,
        });
        // In a real app, you'd send an email here
        return {
          success: true,
          message: `Invite resent to ${invite.email}. New code: ${newCode}`,
        };
      } catch (err) {
        console.error('Error resending invite:', err);
        return { success: false, message: 'Failed to resend invite' };
      }
    },
    [familyId, invites]
  );

  const cancelInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      if (!familyId) return false;

      try {
        const inviteRef = doc(db, 'families', familyId, 'invites', inviteId);
        await deleteDoc(inviteRef);
        return true;
      } catch (err) {
        console.error('Error cancelling invite:', err);
        return false;
      }
    },
    [familyId]
  );

  const pendingInvites = invites.filter((i) => i.status === 'pending');
  const acceptedInvites = invites.filter((i) => i.status === 'accepted');

  return {
    invites,
    pendingInvites,
    acceptedInvites,
    loading,
    error,
    sendInvite,
    resendInvite,
    cancelInvite,
  };
}
