import { useMemo } from 'react';
import { useFeedingLogsFirestore } from './useFeedingLogsFirestore';
import foodsData from '../data/foods.json';
import type { Food, FoodCategory } from '../types';

const allFoods: Food[] = (foodsData as { foods: Food[] }).foods;

export interface FoodStats {
  total: number;
  byCategory: Record<FoodCategory, number>;
  recentFoods: { foodId: string; name: string; date: string }[];
  allUniqueFoodIds: string[];
  customFoodNames: string[];
  progressTo100: number;
}

export interface CategoryBreakdown {
  category: FoodCategory;
  label: string;
  count: number;
  emoji: string;
}

const CATEGORY_INFO: Record<FoodCategory, { label: string; emoji: string }> = {
  fruit: { label: 'Fruits', emoji: '🍎' },
  vegetable: { label: 'Vegetables', emoji: '🥦' },
  protein: { label: 'Proteins', emoji: '🥩' },
  grain: { label: 'Grains', emoji: '🌾' },
  dairy: { label: 'Dairy', emoji: '🧀' },
  legume: { label: 'Legumes', emoji: '🫘' },
  other: { label: 'Other', emoji: '🍽️' },
};

export function useUniqueFoods(babyId?: string) {
  const { logs } = useFeedingLogsFirestore();

  const babyLogs = useMemo(() => {
    if (!babyId) return [];
    return logs.filter((log) => log.babyId === babyId);
  }, [logs, babyId]);

  const stats = useMemo((): FoodStats => {
    const uniqueFoodIds = new Set<string>();
    const customFoodNames = new Set<string>();
    const foodsByDate: { foodId: string; name: string; date: string }[] = [];
    const byCategory: Record<FoodCategory, Set<string>> = {
      fruit: new Set(),
      vegetable: new Set(),
      protein: new Set(),
      grain: new Set(),
      dairy: new Set(),
      legume: new Set(),
      other: new Set(),
    };

    // Process logs
    babyLogs.forEach((log) => {
      if (log.foodId) {
        if (!uniqueFoodIds.has(log.foodId)) {
          uniqueFoodIds.add(log.foodId);
          const food = allFoods.find((f) => f.id === log.foodId);
          if (food) {
            byCategory[food.category].add(log.foodId);
            foodsByDate.push({
              foodId: log.foodId,
              name: food.name,
              date: log.loggedDate,
            });
          }
        }
      } else if (log.customFoodName) {
        const normalizedName = log.customFoodName.toLowerCase().trim();
        if (!customFoodNames.has(normalizedName)) {
          customFoodNames.add(normalizedName);
          byCategory.other.add(`custom:${normalizedName}`);
          foodsByDate.push({
            foodId: `custom:${normalizedName}`,
            name: log.customFoodName,
            date: log.loggedDate,
          });
        }
      }
    });

    // Sort by date descending and get recent 5
    const recentFoods = foodsByDate
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const total = uniqueFoodIds.size + customFoodNames.size;

    return {
      total,
      byCategory: {
        fruit: byCategory.fruit.size,
        vegetable: byCategory.vegetable.size,
        protein: byCategory.protein.size,
        grain: byCategory.grain.size,
        dairy: byCategory.dairy.size,
        legume: byCategory.legume.size,
        other: byCategory.other.size,
      },
      recentFoods,
      allUniqueFoodIds: Array.from(uniqueFoodIds),
      customFoodNames: Array.from(customFoodNames),
      progressTo100: Math.min(total, 100),
    };
  }, [babyLogs]);

  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    return (Object.keys(CATEGORY_INFO) as FoodCategory[]).map((category) => ({
      category,
      label: CATEGORY_INFO[category].label,
      count: stats.byCategory[category],
      emoji: CATEGORY_INFO[category].emoji,
    }));
  }, [stats.byCategory]);

  // Get all foods tried with details
  const allFoodsTried = useMemo(() => {
    return stats.allUniqueFoodIds.map((foodId) => {
      const food = allFoods.find((f) => f.id === foodId);
      return food
        ? { id: foodId, name: food.name, category: food.category, isCustom: false }
        : null;
    }).filter(Boolean).concat(
      stats.customFoodNames.map((name) => ({
        id: `custom:${name}`,
        name,
        category: 'other' as FoodCategory,
        isCustom: true,
      }))
    );
  }, [stats.allUniqueFoodIds, stats.customFoodNames]);

  // Calculate milestone progress
  const milestones = useMemo(() => {
    const total = stats.total;
    return {
      reached25: total >= 25,
      reached50: total >= 50,
      reached75: total >= 75,
      reached100: total >= 100,
      nextMilestone: total < 25 ? 25 : total < 50 ? 50 : total < 75 ? 75 : total < 100 ? 100 : null,
      progressToNext: total < 25
        ? (total / 25) * 100
        : total < 50
        ? ((total - 25) / 25) * 100
        : total < 75
        ? ((total - 50) / 25) * 100
        : total < 100
        ? ((total - 75) / 25) * 100
        : 100,
    };
  }, [stats.total]);

  return {
    stats,
    categoryBreakdown,
    allFoodsTried,
    milestones,
    totalUnique: stats.total,
  };
}
