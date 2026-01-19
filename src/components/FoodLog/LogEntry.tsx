import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button, Card } from '../ui';
import { FoodSearch } from './FoodSearch';
import { ResponsePicker } from './ResponsePicker';
import { ServingMethodPicker } from './ServingMethodPicker';
import { useBabiesFirestore } from '../../hooks/useBabiesFirestore';
import { useFeedingLogsFirestore } from '../../hooks/useFeedingLogsFirestore';
import type { Food, ServingMethod, FeedingResponse, MealTime } from '../../types';
import { MEAL_TIME_LABELS, RESPONSE_EMOJIS } from '../../types';
import foodsData from '../../data/foods.json';

interface LogEntryProps {
  preselectedBabyId?: string;
  onComplete?: () => void;
}

export function LogEntry({ preselectedBabyId, onComplete }: LogEntryProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { babies } = useBabiesFirestore();
  const { addLog, isFirstTimeFood } = useFeedingLogsFirestore();

  // Check for preselected food from URL
  const preselectedFoodId = searchParams.get('food');
  const preselectedFood = preselectedFoodId
    ? (foodsData.foods as Food[]).find((f) => f.id === preselectedFoodId) || null
    : null;

  // Form state
  const [selectedBabyIds, setSelectedBabyIds] = useState<string[]>(
    preselectedBabyId ? [preselectedBabyId] : []
  );
  const [selectedFood, setSelectedFood] = useState<Food | null>(preselectedFood);
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [servingMethods, setServingMethods] = useState<ServingMethod[]>([]);

  // Individual responses for each baby (for twins)
  const [responses, setResponses] = useState<Record<string, FeedingResponse>>({});
  const [useSameResponse, setUseSameResponse] = useState(true);
  const [sharedResponse, setSharedResponse] = useState<FeedingResponse | undefined>();

  const [mealTime, setMealTime] = useState<MealTime | undefined>();
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [firstTimeNames, setFirstTimeNames] = useState<string[]>([]);
  const [_submitting, setSubmitting] = useState(false);

  // Update selected food if URL param changes
  useEffect(() => {
    if (preselectedFood && !selectedFood) {
      setSelectedFood(preselectedFood);
    }
  }, [preselectedFood, selectedFood]);

  const handleFoodSelect = (food: Food | null, custom?: string) => {
    setSelectedFood(food);
    setCustomFoodName(custom || '');
  };

  const toggleBaby = (babyId: string) => {
    setSelectedBabyIds((prev) => {
      const newIds = prev.includes(babyId)
        ? prev.filter((id) => id !== babyId)
        : [...prev, babyId];

      // Clear individual response if baby is deselected
      if (!newIds.includes(babyId)) {
        setResponses((prev) => {
          const { [babyId]: _, ...rest } = prev;
          return rest;
        });
      }
      return newIds;
    });
  };

  const selectAllBabies = () => {
    if (selectedBabyIds.length === babies.length) {
      setSelectedBabyIds([]);
      setResponses({});
    } else {
      setSelectedBabyIds(babies.map((b) => b.id));
    }
  };

  const handleResponseChange = (babyId: string, response: FeedingResponse) => {
    setResponses((prev) => ({ ...prev, [babyId]: response }));
  };

  const canSubmit = () => {
    if (selectedBabyIds.length === 0) return false;
    if (!selectedFood && !customFoodName) return false;
    if (servingMethods.length === 0) return false;

    if (useSameResponse) {
      return !!sharedResponse;
    } else {
      return selectedBabyIds.every((id) => responses[id]);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setSubmitting(true);
    const firstTimers: string[] = [];

    try {
      // Create individual logs for each baby
      for (const babyId of selectedBabyIds) {
        const response = useSameResponse ? sharedResponse! : responses[babyId];
        const isFirst = isFirstTimeFood(babyId, selectedFood?.id, customFoodName);

        if (isFirst) {
          const baby = babies.find((b) => b.id === babyId);
          if (baby) firstTimers.push(baby.name);
        }

        await addLog({
          babyId,
          foodId: selectedFood?.id,
          customFoodName: customFoodName || undefined,
          servingMethod: servingMethods[0], // Primary method
          servingMethods: servingMethods.length > 1 ? servingMethods : undefined,
          response,
          mealTime,
          notes: notes.trim() || undefined,
        });
      }

      setFirstTimeNames(firstTimers);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to log food:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/');
    }
  };

  const handleLogAnother = () => {
    // Reset form but keep baby selection
    setSelectedFood(null);
    setCustomFoodName('');
    setServingMethods([]);
    setResponses({});
    setSharedResponse(undefined);
    setNotes('');
    setShowSuccess(false);
    setFirstTimeNames([]);
  };

  // Success screen
  if (showSuccess) {
    const foodName = selectedFood?.name || customFoodName;
    return (
      <Card padding="lg" className="text-center">
        <div className="text-6xl mb-4">{firstTimeNames.length > 0 ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-charcoal mb-2">
          {firstTimeNames.length > 0 ? 'First Time!' : 'Logged!'}
        </h2>
        <p className="text-gray-600 mb-6">
          {firstTimeNames.length > 0
            ? `${foodName} is a new first for ${firstTimeNames.join(' & ')}!`
            : `${foodName} logged successfully`}
        </p>
        <div className="space-y-3">
          <Button onClick={handleLogAnother} variant="primary" className="w-full">
            Log Another Food
          </Button>
          <Button onClick={handleDone} variant="ghost" className="w-full">
            Done
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-charcoal">Log a Food</h2>
        <p className="text-gray-500 mt-1">What did they try today?</p>
      </div>

      {/* Baby Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-charcoal">
          Who's eating?
        </label>
        <div className="flex flex-wrap gap-2">
          {babies.map((baby) => (
            <button
              key={baby.id}
              type="button"
              onClick={() => toggleBaby(baby.id)}
              className={`
                px-4 py-2 rounded-full border-2 transition-all font-medium
                ${selectedBabyIds.includes(baby.id)
                  ? 'border-sage-400 bg-sage-50 text-sage-700'
                  : 'border-sage-200 bg-white text-gray-600 hover:bg-sage-50'
                }
              `}
            >
              {baby.name}
            </button>
          ))}
          {babies.length > 1 && (
            <button
              type="button"
              onClick={selectAllBabies}
              className={`
                px-4 py-2 rounded-full border-2 transition-all font-medium
                ${selectedBabyIds.length === babies.length
                  ? 'border-coral-400 bg-coral-50 text-coral-700'
                  : 'border-coral-200 bg-white text-coral-600 hover:bg-coral-50'
                }
              `}
            >
              👯 Both
            </button>
          )}
        </div>
      </div>

      {/* Food Search */}
      <FoodSearch
        onSelect={handleFoodSelect}
        selectedFood={selectedFood}
        customFoodName={customFoodName}
      />

      {/* Food Info Link - Show when food is selected */}
      {selectedFood && (
        <Link
          to={`/foods/${selectedFood.id}`}
          className="flex items-center gap-2 p-3 bg-sage-50 rounded-xl border border-sage-200 hover:bg-sage-100 transition-colors"
        >
          <span className="text-xl">📖</span>
          <div className="flex-1">
            <div className="font-medium text-sage-700">View prep guide & tips</div>
            <div className="text-xs text-sage-600">
              {selectedFood.fun_fact ? selectedFood.fun_fact.slice(0, 50) + '...' : 'Learn how to serve safely'}
            </div>
          </div>
          <svg className="w-5 h-5 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Only show rest of form when food is selected */}
      {(selectedFood || customFoodName) && (
        <>
          {/* Serving Method */}
          <ServingMethodPicker value={servingMethods} onChange={setServingMethods} />

          {/* Response Section */}
          {selectedBabyIds.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-charcoal">
                  How did they like it?
                </label>
                <button
                  type="button"
                  onClick={() => setUseSameResponse(!useSameResponse)}
                  className="text-xs text-sage-600 hover:text-sage-700"
                >
                  {useSameResponse ? '↔ Different reactions?' : '✓ Same reaction'}
                </button>
              </div>

              {useSameResponse ? (
                <ResponsePicker value={sharedResponse} onChange={setSharedResponse} />
              ) : (
                <div className="space-y-4">
                  {selectedBabyIds.map((babyId) => {
                    const baby = babies.find((b) => b.id === babyId);
                    return (
                      <div key={babyId} className="p-3 bg-gray-50 rounded-xl">
                        <div className="text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                          {baby?.name}
                          {responses[babyId] && (
                            <span className="text-lg">{RESPONSE_EMOJIS[responses[babyId]]}</span>
                          )}
                        </div>
                        <ResponsePicker
                          value={responses[babyId]}
                          onChange={(r) => handleResponseChange(babyId, r)}
                          compact
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Single baby response */}
          {selectedBabyIds.length === 1 && (
            <ResponsePicker value={sharedResponse} onChange={setSharedResponse} />
          )}

          {/* Meal Time (optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">
              Meal (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealTime[]).map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setMealTime(mealTime === time ? undefined : time)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${mealTime === time
                      ? 'bg-sage-100 text-sage-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {MEAL_TIME_LABELS[time]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Threw it at the dog... 🐕"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200
                       bg-white text-charcoal placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                       transition-colors resize-none"
            />
          </div>

          {/* Allergen Warning */}
          {selectedFood?.is_allergen && (
            <div className="p-3 bg-coral-50 rounded-xl border border-coral-200">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium text-coral-700">
                    Allergen: {selectedFood.allergen_type?.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-coral-600 mt-0.5">
                    Watch for reactions for the next 2 hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            size="lg"
            className="w-full"
          >
            Log Food
          </Button>
        </>
      )}
    </Card>
  );
}
