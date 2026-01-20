import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';
import { useFeedingLogsFirestore } from '../../hooks/useFeedingLogsFirestore';
import { useUniqueFoods } from '../../hooks/useUniqueFoods';
import foodsData from '../../data/foods.json';
import type { Food, FoodCategory } from '../../types';

const allFoods = foodsData.foods as Food[];

interface MealSuggestionsProps {
  babyId: string;
  limit?: number;
}

export function MealSuggestions({ babyId, limit = 5 }: MealSuggestionsProps) {
  const { logs } = useFeedingLogsFirestore();
  const { categoryBreakdown } = useUniqueFoods(babyId);

  const suggestions = useMemo(() => {
    const babyLogs = logs.filter((log) => log.babyId === babyId);
    const triedFoodIds = new Set(babyLogs.map((log) => log.foodId).filter(Boolean));

    // Convert categoryBreakdown array to a lookup map
    const categoryCountMap: Record<string, number> = {};
    categoryBreakdown.forEach((cb) => {
      categoryCountMap[cb.category] = cb.count;
    });

    // Find categories with fewer foods tried
    const categoryPriority: FoodCategory[] = ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'legume'];
    const sortedCategories = [...categoryPriority].sort((a, b) => {
      const aCount = categoryCountMap[a] || 0;
      const bCount = categoryCountMap[b] || 0;
      return aCount - bCount;
    });

    // Get untried foods from underrepresented categories
    const suggestions: Food[] = [];
    const seenCategories = new Set<string>();

    for (const category of sortedCategories) {
      if (suggestions.length >= limit) break;

      const categoryFoods = allFoods.filter(
        (f) => f.category === category && !triedFoodIds.has(f.id)
      );

      // Prioritize iron-rich and non-choking-risk foods
      categoryFoods.sort((a, b) => {
        const aScore =
          (a.iron_content === 'high' ? 3 : a.iron_content === 'medium' ? 2 : 0) +
          (a.choking_risk === 'low' ? 1 : 0);
        const bScore =
          (b.iron_content === 'high' ? 3 : b.iron_content === 'medium' ? 2 : 0) +
          (b.choking_risk === 'low' ? 1 : 0);
        return bScore - aScore;
      });

      for (const food of categoryFoods) {
        if (suggestions.length >= limit) break;
        if (!seenCategories.has(food.category)) {
          suggestions.push(food);
          seenCategories.add(food.category);
        }
      }
    }

    // Fill remaining slots with any untried foods
    if (suggestions.length < limit) {
      const remaining = allFoods
        .filter((f) => !triedFoodIds.has(f.id) && !suggestions.includes(f))
        .slice(0, limit - suggestions.length);
      suggestions.push(...remaining);
    }

    return suggestions;
  }, [logs, babyId, categoryBreakdown, limit]);

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      fruit: '🍎',
      vegetable: '🥦',
      protein: '🍗',
      grain: '🌾',
      dairy: '🧀',
      legume: '🫘',
      other: '🍽️',
    };
    return emojis[category] || '🍽️';
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card padding="md">
      <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
        <span>💡</span>
        Try Next
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Based on foods you haven't tried yet
      </p>
      <div className="space-y-2">
        {suggestions.map((food) => (
          <Link
            key={food.id}
            to={`/log?food=${food.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-sage-50 transition-colors"
          >
            <span className="text-xl">{getCategoryEmoji(food.category)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-charcoal text-sm truncate">
                {food.name}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className="capitalize">{food.category}</span>
                {food.iron_content === 'high' && (
                  <span className="text-coral-500">Iron-rich</span>
                )}
              </div>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </Card>
  );
}
