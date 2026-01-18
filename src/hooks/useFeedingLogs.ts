import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';
import type { FeedingLog, ServingMethod, FeedingResponse, MealTime } from '../types';

export interface AddLogInput {
  babyId: string;
  foodId?: string;
  customFoodName?: string;
  loggedDate?: string; // Defaults to today
  mealTime?: MealTime;
  servingMethod: ServingMethod;
  servingMethods?: ServingMethod[]; // Multiple methods
  response: FeedingResponse;
  notes?: string;
  photoUrl?: string;
}

export function useFeedingLogs() {
  const [logs, setLogs] = useLocalStorage<FeedingLog[]>(STORAGE_KEYS.FEEDING_LOGS, []);

  /**
   * Check if this is the first time a baby has tried a specific food
   */
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

  /**
   * Add a new feeding log entry
   */
  const addLog = useCallback(
    (input: AddLogInput): FeedingLog => {
      const now = new Date().toISOString();
      const loggedDate = input.loggedDate || now.split('T')[0];

      const isFirstTime = isFirstTimeFood(input.babyId, input.foodId, input.customFoodName);

      const newLog: FeedingLog = {
        id: uuidv4(),
        babyId: input.babyId,
        foodId: input.foodId,
        customFoodName: input.customFoodName,
        loggedDate,
        mealTime: input.mealTime,
        servingMethod: input.servingMethod,
        servingMethods: input.servingMethods,
        response: input.response,
        isFirstTime,
        notes: input.notes,
        photoUrl: input.photoUrl,
        createdAt: now,
      };

      setLogs((prev) => [newLog, ...prev]); // Add to beginning for reverse chronological order
      return newLog;
    },
    [setLogs, isFirstTimeFood]
  );

  /**
   * Add logs for multiple babies at once (e.g., "both" option for twins)
   */
  const addLogsForMultipleBabies = useCallback(
    (babyIds: string[], input: Omit<AddLogInput, 'babyId'>): FeedingLog[] => {
      return babyIds.map((babyId) => addLog({ ...input, babyId }));
    },
    [addLog]
  );

  /**
   * Get all logs for a specific baby
   */
  const getLogsForBaby = useCallback(
    (babyId: string): FeedingLog[] => {
      return logs.filter((log) => log.babyId === babyId);
    },
    [logs]
  );

  /**
   * Get unique food IDs that a baby has tried
   */
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

  /**
   * Get logs for today
   */
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

  /**
   * Get all "first time" logs for celebration
   */
  const getFirstTimeLogs = useCallback(
    (babyId?: string): FeedingLog[] => {
      return logs.filter((log) => {
        const matchesBaby = babyId ? log.babyId === babyId : true;
        return log.isFirstTime && matchesBaby;
      });
    },
    [logs]
  );

  /**
   * Get recent logs (last n entries)
   */
  const getRecentLogs = useCallback(
    (limit: number = 10, babyId?: string): FeedingLog[] => {
      const filtered = babyId ? logs.filter((log) => log.babyId === babyId) : logs;
      return filtered.slice(0, limit);
    },
    [logs]
  );

  /**
   * Get a specific log by ID
   */
  const getLogById = useCallback(
    (id: string): FeedingLog | undefined => {
      return logs.find((log) => log.id === id);
    },
    [logs]
  );

  /**
   * Update an existing log entry
   */
  const updateLog = useCallback(
    (id: string, updates: Partial<Omit<FeedingLog, 'id' | 'createdAt' | 'babyId'>>): FeedingLog | null => {
      let updatedLog: FeedingLog | null = null;
      setLogs((prev) =>
        prev.map((log) => {
          if (log.id === id) {
            updatedLog = { ...log, ...updates };
            return updatedLog;
          }
          return log;
        })
      );
      return updatedLog;
    },
    [setLogs]
  );

  /**
   * Delete a log entry
   */
  const deleteLog = useCallback(
    (id: string): boolean => {
      let deleted = false;
      setLogs((prev) => {
        const filtered = prev.filter((log) => log.id !== id);
        deleted = filtered.length < prev.length;
        return filtered;
      });
      return deleted;
    },
    [setLogs]
  );

  /**
   * Check if both twins tried the same new food on the same day
   * (for "Twin Sync" badge detection)
   */
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

    // Find foods where 2+ babies tried it for the first time on the same day
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
