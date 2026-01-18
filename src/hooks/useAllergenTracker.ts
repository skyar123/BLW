import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';
import { useFeedingLogs } from './useFeedingLogs';
import type { AllergenTracker, AllergenType, ReactionSeverity, FeedingLog } from '../types';
import { TOP_9_ALLERGENS } from '../types';
import foodsData from '../data/foods.json';

// Maintenance schedule: re-expose to allergens every 3-7 days to maintain tolerance
const MAINTENANCE_DAYS_MIN = 3;
const MAINTENANCE_DAYS_MAX = 7;
const MAINTENANCE_DAYS_WARNING = 5; // Show warning after 5 days

export interface AllergenStatus {
  allergenType: AllergenType;
  status: 'not_introduced' | 'introduced' | 'cleared' | 'reaction';
  introductionDate?: string;
  lastExposureDate?: string;
  daysSinceExposure?: number;
  needsMaintenance: boolean;
  maintenanceUrgency: 'ok' | 'soon' | 'overdue';
  exposureCount: number;
  hadReaction: boolean;
  reactionSeverity?: ReactionSeverity;
  reactionNotes?: string;
}

export function useAllergenTracker() {
  const [trackers, setTrackers] = useLocalStorage<AllergenTracker[]>(
    STORAGE_KEYS.ALLERGEN_TRACKERS || 'first-bites-allergen-trackers',
    []
  );
  const { logs } = useFeedingLogs();

  // Get foods that are allergens
  const allergenFoods = useMemo(() => {
    return (foodsData.foods as Array<{ id: string; allergen_type?: string }>).filter(
      (f) => f.allergen_type
    );
  }, []);

  // Map food IDs to allergen types
  const foodToAllergen = useMemo(() => {
    const map: Record<string, AllergenType> = {};
    allergenFoods.forEach((f) => {
      if (f.allergen_type) {
        map[f.id] = f.allergen_type as AllergenType;
      }
    });
    return map;
  }, [allergenFoods]);

  // Get all allergen exposures from logs for a baby
  const getAllergenExposures = useCallback(
    (babyId: string, allergenType: AllergenType): FeedingLog[] => {
      return logs.filter((log) => {
        if (log.babyId !== babyId) return false;
        if (!log.foodId) return false;
        return foodToAllergen[log.foodId] === allergenType;
      });
    },
    [logs, foodToAllergen]
  );

  // Get allergen status for a specific baby and allergen
  const getAllergenStatus = useCallback(
    (babyId: string, allergenType: AllergenType): AllergenStatus => {
      const tracker = trackers.find(
        (t) => t.babyId === babyId && t.allergenType === allergenType
      );
      const exposures = getAllergenExposures(babyId, allergenType);

      // Calculate days since last exposure
      let daysSinceExposure: number | undefined;
      let lastExposureDate: string | undefined;

      if (exposures.length > 0) {
        // Sort by date descending
        const sortedExposures = [...exposures].sort(
          (a, b) => new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime()
        );
        lastExposureDate = sortedExposures[0].loggedDate;
        const lastDate = new Date(lastExposureDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        daysSinceExposure = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Determine maintenance urgency
      let maintenanceUrgency: 'ok' | 'soon' | 'overdue' = 'ok';
      let needsMaintenance = false;

      if (exposures.length > 0 && daysSinceExposure !== undefined) {
        if (daysSinceExposure >= MAINTENANCE_DAYS_MAX) {
          maintenanceUrgency = 'overdue';
          needsMaintenance = true;
        } else if (daysSinceExposure >= MAINTENANCE_DAYS_WARNING) {
          maintenanceUrgency = 'soon';
          needsMaintenance = true;
        }
      }

      // Determine status
      let status: AllergenStatus['status'] = 'not_introduced';
      if (tracker?.hadReaction) {
        status = 'reaction';
      } else if (tracker?.isCleared) {
        status = 'cleared';
      } else if (exposures.length > 0 || tracker?.introductionDate) {
        status = 'introduced';
      }

      return {
        allergenType,
        status,
        introductionDate: tracker?.introductionDate || exposures[0]?.loggedDate,
        lastExposureDate: lastExposureDate || tracker?.lastExposureDate,
        daysSinceExposure,
        needsMaintenance,
        maintenanceUrgency,
        exposureCount: exposures.length,
        hadReaction: tracker?.hadReaction || false,
        reactionSeverity: tracker?.reactionSeverity,
        reactionNotes: tracker?.reactionNotes,
      };
    },
    [trackers, getAllergenExposures]
  );

  // Get all allergen statuses for a baby
  const getAllAllergenStatuses = useCallback(
    (babyId: string): AllergenStatus[] => {
      return TOP_9_ALLERGENS.map((allergen) => getAllergenStatus(babyId, allergen));
    },
    [getAllergenStatus]
  );

  // Get allergens that need maintenance for a baby
  const getMaintenanceReminders = useCallback(
    (babyId: string): AllergenStatus[] => {
      return getAllAllergenStatuses(babyId).filter(
        (s) => s.needsMaintenance && s.status !== 'reaction'
      );
    },
    [getAllAllergenStatuses]
  );

  // Record a reaction to an allergen
  const recordReaction = useCallback(
    (
      babyId: string,
      allergenType: AllergenType,
      severity: ReactionSeverity,
      notes?: string
    ): AllergenTracker => {
      const existing = trackers.find(
        (t) => t.babyId === babyId && t.allergenType === allergenType
      );

      if (existing) {
        const updated: AllergenTracker = {
          ...existing,
          hadReaction: true,
          reactionSeverity: severity,
          reactionNotes: notes,
          isCleared: false,
        };
        setTrackers((prev) =>
          prev.map((t) => (t.id === existing.id ? updated : t))
        );
        return updated;
      } else {
        const newTracker: AllergenTracker = {
          id: uuidv4(),
          babyId,
          allergenType,
          hadReaction: true,
          reactionSeverity: severity,
          reactionNotes: notes,
          isCleared: false,
        };
        setTrackers((prev) => [...prev, newTracker]);
        return newTracker;
      }
    },
    [trackers, setTrackers]
  );

  // Mark an allergen as cleared (no reaction after multiple exposures)
  const markAsCleared = useCallback(
    (babyId: string, allergenType: AllergenType): AllergenTracker => {
      const existing = trackers.find(
        (t) => t.babyId === babyId && t.allergenType === allergenType
      );

      if (existing) {
        const updated: AllergenTracker = {
          ...existing,
          isCleared: true,
          hadReaction: false,
          reactionSeverity: undefined,
          reactionNotes: undefined,
        };
        setTrackers((prev) =>
          prev.map((t) => (t.id === existing.id ? updated : t))
        );
        return updated;
      } else {
        const newTracker: AllergenTracker = {
          id: uuidv4(),
          babyId,
          allergenType,
          hadReaction: false,
          isCleared: true,
        };
        setTrackers((prev) => [...prev, newTracker]);
        return newTracker;
      }
    },
    [trackers, setTrackers]
  );

  // Clear a reaction (e.g., if it was a false alarm)
  const clearReaction = useCallback(
    (babyId: string, allergenType: AllergenType): void => {
      setTrackers((prev) =>
        prev.map((t) => {
          if (t.babyId === babyId && t.allergenType === allergenType) {
            return {
              ...t,
              hadReaction: false,
              reactionSeverity: undefined,
              reactionNotes: undefined,
            };
          }
          return t;
        })
      );
    },
    [setTrackers]
  );

  // Get summary stats for a baby
  const getStats = useCallback(
    (babyId: string) => {
      const statuses = getAllAllergenStatuses(babyId);
      return {
        introduced: statuses.filter((s) => s.status === 'introduced').length,
        cleared: statuses.filter((s) => s.status === 'cleared').length,
        reactions: statuses.filter((s) => s.status === 'reaction').length,
        notIntroduced: statuses.filter((s) => s.status === 'not_introduced').length,
        needingMaintenance: statuses.filter((s) => s.needsMaintenance).length,
        total: TOP_9_ALLERGENS.length,
      };
    },
    [getAllAllergenStatuses]
  );

  return {
    trackers,
    getAllergenStatus,
    getAllAllergenStatuses,
    getMaintenanceReminders,
    getAllergenExposures,
    recordReaction,
    markAsCleared,
    clearReaction,
    getStats,
    foodToAllergen,
    MAINTENANCE_DAYS_MIN,
    MAINTENANCE_DAYS_MAX,
    MAINTENANCE_DAYS_WARNING,
  };
}
