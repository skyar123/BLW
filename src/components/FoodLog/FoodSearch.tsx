import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui';
import type { Food } from '../../types';
import foodsData from '../../data/foods.json';

interface FoodSearchProps {
  onSelect: (food: Food | null, customName?: string) => void;
  selectedFood?: Food | null;
  customFoodName?: string;
}

export function FoodSearch({ onSelect, selectedFood, customFoodName }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const foods = foodsData.foods as Food[];

  const filteredFoods = useMemo(() => {
    if (!query.trim()) return foods.slice(0, 10); // Show first 10 by default

    const lowerQuery = query.toLowerCase();
    return foods
      .filter((food) => food.name.toLowerCase().includes(lowerQuery))
      .slice(0, 15);
  }, [query, foods]);

  const handleFoodSelect = (food: Food) => {
    onSelect(food);
    setQuery('');
    setShowCustom(false);
  };

  const handleCustomFood = () => {
    if (query.trim()) {
      onSelect(null, query.trim());
      setShowCustom(false);
    }
  };

  // If a food is already selected, show it
  if (selectedFood || customFoodName) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-charcoal">Food</label>
        <div
          className="flex items-center justify-between p-3 bg-sage-50 rounded-xl cursor-pointer hover:bg-sage-100 transition-colors"
          onClick={() => onSelect(null)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {selectedFood?.category === 'fruit' && '🍎'}
              {selectedFood?.category === 'vegetable' && '🥦'}
              {selectedFood?.category === 'protein' && '🍗'}
              {selectedFood?.category === 'grain' && '🍞'}
              {selectedFood?.category === 'dairy' && '🧀'}
              {selectedFood?.category === 'legume' && '🫘'}
              {selectedFood?.category === 'other' && '🍽️'}
              {!selectedFood && '✏️'}
            </span>
            <div>
              <div className="font-medium">{selectedFood?.name || customFoodName}</div>
              {selectedFood?.is_allergen && (
                <span className="text-xs text-coral-500">⚠️ Allergen</span>
              )}
              {!selectedFood && <span className="text-xs text-gray-500">Custom food</span>}
            </div>
          </div>
          <span className="text-gray-400 text-sm">Change</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal">Food</label>
      <Input
        placeholder="Search for a food..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowCustom(e.target.value.trim().length > 0);
        }}
        autoFocus
      />

      <div className="max-h-64 overflow-y-auto space-y-1">
        {/* Custom food option */}
        {showCustom && query.trim() && (
          <button
            onClick={handleCustomFood}
            className="w-full p-3 text-left rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors flex items-center gap-3"
          >
            <span className="text-xl">✏️</span>
            <div>
              <div className="font-medium">Add "{query.trim()}"</div>
              <div className="text-xs text-gray-500">Not in database</div>
            </div>
          </button>
        )}

        {/* Food list */}
        {filteredFoods.map((food) => (
          <div key={food.id} className="flex items-center gap-1">
            <button
              onClick={() => handleFoodSelect(food)}
              className="flex-1 p-3 text-left rounded-xl hover:bg-sage-50 transition-colors flex items-center gap-3"
            >
              <span className="text-xl">
                {food.category === 'fruit' && '🍎'}
                {food.category === 'vegetable' && '🥦'}
                {food.category === 'protein' && '🍗'}
                {food.category === 'grain' && '🍞'}
                {food.category === 'dairy' && '🧀'}
                {food.category === 'legume' && '🫘'}
                {food.category === 'other' && '🍽️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{food.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="capitalize">{food.category}</span>
                  {food.is_allergen && (
                    <span className="text-coral-500">⚠️ Allergen</span>
                  )}
                  {food.iron_content === 'high' && (
                    <span className="text-sage-600">🔩 Iron-rich</span>
                  )}
                </div>
              </div>
            </button>
            <Link
              to={`/foods/${food.id}`}
              className="p-2 text-sage-500 hover:text-sage-700 hover:bg-sage-50 rounded-full transition-colors"
              title="View food details"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        ))}

        {filteredFoods.length === 0 && query && (
          <div className="text-center py-4 text-gray-500">
            No foods found. Add as custom above.
          </div>
        )}
      </div>
    </div>
  );
}
