import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useFeedingLogsFirestore } from '../hooks/useFeedingLogsFirestore';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import foodsData from '../data/foods.json';
import type { Food, FoodCategory } from '../types';

const allFoods = foodsData.foods as Food[];

interface ShoppingItem {
  food: Food;
  reason: string;
}

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { logs } = useFeedingLogsFirestore();
  useBabiesFirestore(); // Keep for potential future use
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const suggestions = useMemo((): ShoppingItem[] => {
    const triedFoodIds = new Set(logs.map((log) => log.foodId).filter(Boolean));
    const items: ShoppingItem[] = [];

    // Get category counts
    const categoryCounts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.foodId) {
        const food = allFoods.find((f) => f.id === log.foodId);
        if (food) {
          categoryCounts[food.category] = (categoryCounts[food.category] || 0) + 1;
        }
      }
    });

    // Find underrepresented categories
    const categories: FoodCategory[] = ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'legume'];
    const sortedCategories = categories.sort(
      (a, b) => (categoryCounts[a] || 0) - (categoryCounts[b] || 0)
    );

    // Add suggestions from each category
    for (const category of sortedCategories) {
      const categoryFoods = allFoods
        .filter((f) => f.category === category && !triedFoodIds.has(f.id))
        .slice(0, 2);

      for (const food of categoryFoods) {
        if (items.length < 10) {
          items.push({
            food,
            reason: `Try new ${category}`,
          });
        }
      }
    }

    // Add iron-rich foods if not enough
    const ironRich = allFoods
      .filter((f) => f.iron_content === 'high' && !triedFoodIds.has(f.id))
      .slice(0, 3);

    for (const food of ironRich) {
      if (!items.find((i) => i.food.id === food.id) && items.length < 12) {
        items.push({
          food,
          reason: 'Iron-rich',
        });
      }
    }

    return items;
  }, [logs]);

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

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addCustomItem = () => {
    if (newItem.trim()) {
      setCustomItems((prev) => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeCustomItem = (index: number) => {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = () => {
    const uncheckedSuggestions = suggestions
      .filter((s) => !checkedItems.has(s.food.id))
      .map((s) => `- ${s.food.name}`);

    const allItems = [...uncheckedSuggestions, ...customItems.map((item) => `- ${item}`)];

    navigator.clipboard.writeText(allItems.join('\n'));
    alert('Shopping list copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-charcoal dark:text-white">Shopping List</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Foods to try next
              </p>
            </div>
            <Button onClick={copyToClipboard} variant="secondary" size="sm">
              Copy
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Suggested Items */}
        <Card padding="md">
          <h2 className="font-semibold text-charcoal dark:text-white mb-3 flex items-center gap-2">
            <span>💡</span>
            Suggested Foods
          </h2>
          <div className="space-y-2">
            {suggestions.map((item) => (
              <label
                key={item.food.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                  ${checkedItems.has(item.food.id) ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-sage-50 dark:hover:bg-gray-700'}`}
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.food.id)}
                  onChange={() => toggleItem(item.food.id)}
                  className="w-5 h-5 rounded border-gray-300 text-sage-500 focus:ring-sage-500"
                />
                <span className="text-xl">{getCategoryEmoji(item.food.category)}</span>
                <div className="flex-1">
                  <span
                    className={`font-medium ${
                      checkedItems.has(item.food.id)
                        ? 'line-through text-gray-400'
                        : 'text-charcoal dark:text-white'
                    }`}
                  >
                    {item.food.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {item.reason}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Custom Items */}
        <Card padding="md">
          <h2 className="font-semibold text-charcoal dark:text-white mb-3 flex items-center gap-2">
            <span>📝</span>
            Custom Items
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add item..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-charcoal dark:text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-sage-400"
              onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
            />
            <Button onClick={addCustomItem} size="sm">
              Add
            </Button>
          </div>

          {customItems.length > 0 && (
            <div className="space-y-2">
              {customItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <span className="flex-1 text-charcoal dark:text-white">{item}</span>
                  <button
                    onClick={() => removeCustomItem(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card padding="md" className="bg-sage-50 dark:bg-sage-900/20">
          <h3 className="font-medium text-sage-700 dark:text-sage-300 mb-2">
            Shopping Tips
          </h3>
          <ul className="text-sm text-sage-600 dark:text-sage-400 space-y-1">
            <li>• Buy organic for "dirty dozen" produce when possible</li>
            <li>• Choose ripe fruits - easier to mash and safer</li>
            <li>• Look for low-sodium options for canned goods</li>
            <li>• Fresh is best, but frozen veggies are great too!</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
