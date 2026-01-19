import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFamily } from './useFamily';
import { useFeedingLogsFirestore } from './useFeedingLogsFirestore';
import badgesData from '../data/badges.json';
import foodsData from '../data/foods.json';
import type { Badge, EarnedBadge, Food, FoodCategory, AllergenType } from '../types';

const allBadges: Badge[] = badgesData.badges as Badge[];
const allFoods: Food[] = (foodsData as { foods: Food[] }).foods;

// Helper to get food by ID
const getFoodById = (foodId: string): Food | undefined => {
  return allFoods.find((f) => f.id === foodId);
};

export interface BadgeProgress {
  badge: Badge;
  earned: boolean;
  earnedDate?: string;
  progress: number; // 0-100 percentage
  current: number;
  target: number;
}

export function useBadges(babyId?: string) {
  const { familyId } = useFamily();
  const { logs, twinSyncs } = useFeedingLogsFirestore();
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);

  // Listen for earned badges from Firestore
  useEffect(() => {
    if (!familyId || !babyId) {
      setEarnedBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const badgesRef = collection(db, 'families', familyId, 'earned_badges');
    const q = query(badgesRef, where('babyId', '==', babyId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const badges = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EarnedBadge[];
        setEarnedBadges(badges);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching earned badges:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId, babyId]);

  // Get logs for specific baby
  const babyLogs = useMemo(() => {
    if (!babyId) return [];
    return logs.filter((log) => log.babyId === babyId);
  }, [logs, babyId]);

  // Calculate badge progress/status
  const calculateBadgeProgress = useCallback(
    (badge: Badge): { earned: boolean; progress: number; current: number; target: number } => {
      const criteria = badge.criteria;
      const type = criteria.type;
      const targetValue = typeof criteria.value === 'number' ? criteria.value : 1;

      switch (type) {
        case 'total_logs': {
          const current = babyLogs.length;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'unique_days_logged': {
          const uniqueDays = new Set(babyLogs.map((log) => log.loggedDate));
          const current = uniqueDays.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'colors_in_7_days': {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

          const recentLogs = babyLogs.filter((log) => log.loggedDate >= sevenDaysAgoStr);
          const colors = new Set<string>();

          recentLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food?.color) colors.add(food.color);
            }
          });

          const current = colors.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'consecutive_days_with_tag': {
          const tag = criteria.tag as string;
          const tagValues = criteria.tag_values as string[];

          // Get all dates with iron-rich foods
          const datesWithTag = new Set<string>();
          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food && tag === 'iron_content' && tagValues.includes(food.iron_content)) {
                datesWithTag.add(log.loggedDate);
              }
            }
          });

          // Find longest consecutive streak
          const sortedDates = Array.from(datesWithTag).sort();
          let maxStreak = 0;
          let currentStreak = 0;
          let prevDate: Date | null = null;

          sortedDates.forEach((dateStr) => {
            const date = new Date(dateStr);
            if (prevDate) {
              const diffDays = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                currentStreak++;
              } else {
                currentStreak = 1;
              }
            } else {
              currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            prevDate = date;
          });

          return {
            earned: maxStreak >= targetValue,
            progress: Math.min((maxStreak / targetValue) * 100, 100),
            current: maxStreak,
            target: targetValue,
          };
        }

        case 'allergens_introduced': {
          const allergenTypes = new Set<string>();
          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food?.is_allergen && food.allergen_type) {
                allergenTypes.add(food.allergen_type);
              }
            }
          });
          const current = allergenTypes.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'same_first_food_same_day': {
          // Twin sync badge
          const earned = twinSyncs.length > 0;
          return {
            earned,
            progress: earned ? 100 : 0,
            current: earned ? 1 : 0,
            target: 1,
          };
        }

        case 'same_first_food_same_day_count': {
          const current = twinSyncs.length;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'unique_foods_in_category': {
          const category = criteria.category as FoodCategory;
          const foodsInCategory = new Set<string>();

          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food?.category === category) {
                foodsInCategory.add(log.foodId);
              }
            }
          });

          const current = foodsInCategory.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'unique_foods': {
          const uniqueFoods = new Set<string>();
          babyLogs.forEach((log) => {
            if (log.foodId) uniqueFoods.add(log.foodId);
            if (log.customFoodName) uniqueFoods.add(`custom:${log.customFoodName.toLowerCase()}`);
          });
          const current = uniqueFoods.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'unique_cultural_tags': {
          const cultures = new Set<string>();
          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              food?.cultural_tags?.forEach((tag) => cultures.add(tag));
            }
          });
          const current = cultures.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'response_count': {
          const responseType = criteria.response as string;
          const current = babyLogs.filter((log) => log.response === responseType).length;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'food_retry_success': {
          // Check if any food that was refused/disliked was later tried again with different response
          const foodResponses: Record<string, string[]> = {};

          // Sort logs by date to track progression
          const sortedLogs = [...babyLogs].sort(
            (a, b) => new Date(a.loggedDate).getTime() - new Date(b.loggedDate).getTime()
          );

          let foundRetrySuccess = false;
          sortedLogs.forEach((log) => {
            const foodKey = log.foodId || `custom:${log.customFoodName?.toLowerCase()}`;
            if (!foodKey) return;

            if (!foodResponses[foodKey]) {
              foodResponses[foodKey] = [];
            }

            const prevResponses = foodResponses[foodKey];
            const wasRefused = prevResponses.includes('refused') || prevResponses.includes('disliked');
            const isNowBetter = ['loved', 'meh'].includes(log.response);

            if (wasRefused && isNowBetter) {
              foundRetrySuccess = true;
            }

            foodResponses[foodKey].push(log.response);
          });

          return {
            earned: foundRetrySuccess,
            progress: foundRetrySuccess ? 100 : 0,
            current: foundRetrySuccess ? 1 : 0,
            target: 1,
          };
        }

        case 'first_serving_method': {
          const method = criteria.serving_method as string;
          const hasMethod = babyLogs.some(
            (log) => log.servingMethod === method || log.servingMethods?.includes(method as any)
          );
          return {
            earned: hasMethod,
            progress: hasMethod ? 100 : 0,
            current: hasMethod ? 1 : 0,
            target: 1,
          };
        }

        case 'foods_with_tag': {
          const tag = criteria.tag as string;
          const foodsWithTag = new Set<string>();

          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food) {
                if (tag === 'omega_3_rich' && food.omega_3_rich) {
                  foodsWithTag.add(log.foodId);
                }
                if (tag === 'vitamin_c_rich' && food.vitamin_c_rich) {
                  foodsWithTag.add(log.foodId);
                }
              }
            }
          });

          const current = foodsWithTag.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'allergen_type_variety': {
          const allergenTypes = criteria.allergen_type as AllergenType[];
          const seafoodFoods = new Set<string>();

          babyLogs.forEach((log) => {
            if (log.foodId) {
              const food = getFoodById(log.foodId);
              if (food?.is_allergen && food.allergen_type && allergenTypes.includes(food.allergen_type)) {
                seafoodFoods.add(log.foodId);
              }
            }
          });

          const current = seafoodFoods.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'unique_serving_methods': {
          const methods = new Set<string>();
          babyLogs.forEach((log) => {
            methods.add(log.servingMethod);
            log.servingMethods?.forEach((m) => methods.add(m));
          });
          // Remove 'other' from count
          methods.delete('other');
          const current = methods.size;
          return {
            earned: current >= targetValue,
            progress: Math.min((current / targetValue) * 100, 100),
            current,
            target: targetValue,
          };
        }

        case 'same_food_loved_count': {
          const lovedCounts: Record<string, number> = {};
          babyLogs
            .filter((log) => log.response === 'loved')
            .forEach((log) => {
              const foodKey = log.foodId || `custom:${log.customFoodName?.toLowerCase()}`;
              if (foodKey) {
                lovedCounts[foodKey] = (lovedCounts[foodKey] || 0) + 1;
              }
            });

          const maxLoved = Math.max(0, ...Object.values(lovedCounts));
          return {
            earned: maxLoved >= targetValue,
            progress: Math.min((maxLoved / targetValue) * 100, 100),
            current: maxLoved,
            target: targetValue,
          };
        }

        case 'days_since_first_log': {
          if (babyLogs.length === 0) {
            return { earned: false, progress: 0, current: 0, target: targetValue };
          }

          const sortedLogs = [...babyLogs].sort(
            (a, b) => new Date(a.loggedDate).getTime() - new Date(b.loggedDate).getTime()
          );
          const firstLogDate = new Date(sortedLogs[0].loggedDate);
          const today = new Date();
          const daysSince = Math.floor(
            (today.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            earned: daysSince >= targetValue,
            progress: Math.min((daysSince / targetValue) * 100, 100),
            current: daysSince,
            target: targetValue,
          };
        }

        default:
          return { earned: false, progress: 0, current: 0, target: 1 };
      }
    },
    [babyLogs, twinSyncs]
  );

  // Get all badge progress
  const badgeProgress = useMemo((): BadgeProgress[] => {
    return allBadges.map((badge) => {
      const progress = calculateBadgeProgress(badge);
      const earnedRecord = earnedBadges.find((eb) => eb.badgeId === badge.id);

      return {
        badge,
        earned: !!earnedRecord || progress.earned,
        earnedDate: earnedRecord?.earnedDate,
        progress: progress.progress,
        current: progress.current,
        target: progress.target,
      };
    });
  }, [calculateBadgeProgress, earnedBadges]);

  // Award a badge
  const awardBadge = useCallback(
    async (badge: Badge, triggeringLogId?: string) => {
      if (!familyId || !babyId) return;

      // Check if already earned
      const alreadyEarned = earnedBadges.some((eb) => eb.badgeId === badge.id);
      if (alreadyEarned) return;

      const badgesRef = collection(db, 'families', familyId, 'earned_badges');
      await addDoc(badgesRef, {
        babyId,
        badgeId: badge.id,
        earnedDate: new Date().toISOString(),
        triggeringLogId: triggeringLogId || null,
        createdAt: serverTimestamp(),
      });

      // Show celebration
      setNewlyEarnedBadge(badge);
    },
    [familyId, babyId, earnedBadges]
  );

  // Check for new badges to award
  const checkForNewBadges = useCallback(
    async (triggeringLogId?: string) => {
      for (const bp of badgeProgress) {
        if (bp.earned && !earnedBadges.some((eb) => eb.badgeId === bp.badge.id)) {
          await awardBadge(bp.badge, triggeringLogId);
          break; // Award one at a time
        }
      }
    },
    [badgeProgress, earnedBadges, awardBadge]
  );

  // Dismiss celebration
  const dismissCelebration = useCallback(() => {
    setNewlyEarnedBadge(null);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const earned = badgeProgress.filter((bp) => bp.earned).length;
    const total = allBadges.length;
    const nextBadge = badgeProgress.find((bp) => !bp.earned && bp.progress > 0);

    return {
      earnedCount: earned,
      totalCount: total,
      nextBadge,
      completionPercentage: Math.round((earned / total) * 100),
    };
  }, [badgeProgress]);

  return {
    badges: allBadges,
    badgeProgress,
    earnedBadges,
    loading,
    newlyEarnedBadge,
    dismissCelebration,
    checkForNewBadges,
    stats,
  };
}
