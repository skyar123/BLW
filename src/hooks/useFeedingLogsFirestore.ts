import { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { FeedingLog, ServingMethod, FeedingResponse, MealTime } from '../types';

export interface AddLogInput {
  babyId: string;
  foodId?: string;
  customFoodName?: string;
  loggedDate?: string;
  mealTime?: MealTime;
  servingMethod: ServingMethod;
  servingMethods?: ServingMethod[];
  response: FeedingResponse;
  notes?: string;
  photoUrl?: string;
}

export function useFeedingLogsFirestore() {
  const { familyId } = useFamily();
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for feeding logs
  useEffect(() => {
    if (!familyId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const logsRef = collection(db, 'families', familyId, 'logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        }) as FeedingLog[];

        setLogs(logsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching logs:', err);
        setError('Failed to load feeding logs');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  // Check if this is the first time a baby has tried a specific food
  const isFirstTimeFood = useCallback(
    (babyId: string, foodId?: string, customFoodName?: string): boolean => {
      if (!foodId && !customFoodName) return false;

      return !logs.some((log) => {
        if (log.babyId !== babyId) return false;
        if (foodId && log.foodId === foodId) return true;
        if (customFoodName && log.customFoodName?.toLowerCase() === customFoodName.toLowerCase()) {
          return true;
        }
        return false;
      });
    },
    [logs]
  );

  const addLog = useCallback(
    async (input: AddLogInput): Promise<FeedingLog> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const now = new Date().toISOString();
      const loggedDate = input.loggedDate || now.split('T')[0];
      const isFirstTime = isFirstTimeFood(input.babyId, input.foodId, input.customFoodName);

      const logsRef = collection(db, 'families', familyId, 'logs');

      const logData = {
        babyId: input.babyId,
        foodId: input.foodId || null,
        customFoodName: input.customFoodName || null,
        loggedDate,
        mealTime: input.mealTime || null,
        servingMethod: input.servingMethod,
        servingMethods: input.servingMethods || null,
        response: input.response,
        isFirstTime,
        notes: input.notes || null,
        photoUrl: input.photoUrl || null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(logsRef, logData);

      return {
        id: docRef.id,
        ...input,
        loggedDate,
        isFirstTime,
        createdAt: now,
      } as FeedingLog;
    },
    [familyId, isFirstTimeFood]
  );

  const addLogsForMultipleBabies = useCallback(
    async (babyIds: string[], input: Omit<AddLogInput, 'babyId'>): Promise<FeedingLog[]> => {
      const results = await Promise.all(
        babyIds.map((babyId) => addLog({ ...input, babyId }))
      );
      return results;
    },
    [addLog]
  );

  const getLogsForBaby = useCallback(
    (babyId: string): FeedingLog[] => {
      return logs.filter((log) => log.babyId === babyId);
    },
    [logs]
  );

  const getUniqueFoodsForBaby = useCallback(
    (babyId: string): string[] => {
      const babyLogs = logs.filter((log) => log.babyId === babyId);
      const foodIds = new Set<string>();

      babyLogs.forEach((log) => {
        if (log.foodId) {
          foodIds.add(log.foodId);
        }
      });

      return Array.from(foodIds);
    },
    [logs]
  );

  const getTodaysLogs = useCallback(
    (babyId?: string): FeedingLog[] => {
      const today = new Date().toISOString().split('T')[0];
      return logs.filter((log) => {
        const matchesDate = log.loggedDate === today;
        const matchesBaby = babyId ? log.babyId === babyId : true;
        return matchesDate && matchesBaby;
      });
    },
    [logs]
  );

  const getFirstTimeLogs = useCallback(
    (babyId?: string): FeedingLog[] => {
      return logs.filter((log) => {
        const matchesBaby = babyId ? log.babyId === babyId : true;
        return log.isFirstTime && matchesBaby;
      });
    },
    [logs]
  );

  const getRecentLogs = useCallback(
    (limit: number = 10, babyId?: string): FeedingLog[] => {
      const filtered = babyId ? logs.filter((log) => log.babyId === babyId) : logs;
      return filtered.slice(0, limit);
    },
    [logs]
  );

  const getLogById = useCallback(
    (id: string): FeedingLog | undefined => {
      return logs.find((log) => log.id === id);
    },
    [logs]
  );

  const updateLog = useCallback(
    async (id: string, updates: Partial<Omit<FeedingLog, 'id' | 'createdAt' | 'babyId'>>): Promise<FeedingLog | null> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      const logRef = doc(db, 'families', familyId, 'logs', id);
      await updateDoc(logRef, updates);

      const existingLog = logs.find((log) => log.id === id);
      if (existingLog) {
        return { ...existingLog, ...updates };
      }
      return null;
    },
    [familyId, logs]
  );

  const deleteLog = useCallback(
    async (id: string): Promise<boolean> => {
      if (!familyId) {
        throw new Error('No family loaded');
      }

      try {
        const logRef = doc(db, 'families', familyId, 'logs', id);
        await deleteDoc(logRef);
        return true;
      } catch (err) {
        console.error('Error deleting log:', err);
        return false;
      }
    },
    [familyId]
  );

  // Check if both twins tried the same new food on the same day
  const checkTwinSync = useMemo(() => {
    const firstTimesByDate: Record<string, Record<string, string[]>> = {};

    logs
      .filter((log) => log.isFirstTime && log.foodId)
      .forEach((log) => {
        const date = log.loggedDate;
        const foodId = log.foodId!;

        if (!firstTimesByDate[date]) {
          firstTimesByDate[date] = {};
        }
        if (!firstTimesByDate[date][foodId]) {
          firstTimesByDate[date][foodId] = [];
        }
        firstTimesByDate[date][foodId].push(log.babyId);
      });

    const twinSyncs: { date: string; foodId: string; babyIds: string[] }[] = [];

    Object.entries(firstTimesByDate).forEach(([date, foods]) => {
      Object.entries(foods).forEach(([foodId, babyIds]) => {
        if (babyIds.length >= 2) {
          twinSyncs.push({ date, foodId, babyIds });
        }
      });
    });

    return twinSyncs;
  }, [logs]);

  return {
    logs,
    loading,
    error,
    addLog,
    addLogsForMultipleBabies,
    getLogsForBaby,
    getLogById,
    updateLog,
    getUniqueFoodsForBaby,
    getTodaysLogs,
    getFirstTimeLogs,
    getRecentLogs,
    deleteLog,
    isFirstTimeFood,
    twinSyncs: checkTwinSync,
    totalLogs: logs.length,
  };
}
