import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button, Card } from '../components/ui';
import { ResponsePicker } from '../components/FoodLog/ResponsePicker';
import { ServingMethodPicker } from '../components/FoodLog/ServingMethodPicker';
import { useFeedingLogsFirestore } from '../hooks/useFeedingLogsFirestore';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import type { Food, ServingMethod, FeedingResponse, MealTime } from '../types';
import {
  RESPONSE_EMOJIS,
  RESPONSE_LABELS,
  SERVING_METHOD_LABELS,
  MEAL_TIME_LABELS,
} from '../types';
import foodsData from '../data/foods.json';

export function LogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const navigate = useNavigate();
  const { getLogById, updateLog, deleteLog, loading: logsLoading } = useFeedingLogsFirestore();
  const { babies, loading: babiesLoading } = useBabiesFirestore();

  const log = logId ? getLogById(logId) : undefined;
  const baby = log ? babies.find((b) => b.id === log.babyId) : undefined;
  const food = log?.foodId
    ? (foodsData.foods as Food[]).find((f) => f.id === log.foodId)
    : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [editResponse, setEditResponse] = useState<FeedingResponse | undefined>(log?.response);
  const [editMethods, setEditMethods] = useState<ServingMethod[]>(
    log?.servingMethods || (log?.servingMethod ? [log.servingMethod] : [])
  );
  const [editMealTime, setEditMealTime] = useState<MealTime | undefined>(log?.mealTime);
  const [editNotes, setEditNotes] = useState(log?.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (logsLoading || babiesLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🥑</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-6xl mb-4">🤷</div>
          <h1 className="text-xl font-bold text-charcoal mb-2">Log not found</h1>
          <p className="text-gray-600 mb-4">We couldn't find that food log.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editResponse || editMethods.length === 0) return;

    try {
      await updateLog(log.id, {
        response: editResponse,
        servingMethod: editMethods[0],
        servingMethods: editMethods.length > 1 ? editMethods : undefined,
        mealTime: editMealTime,
        notes: editNotes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLog(log.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const foodName = food?.name || log.customFoodName || 'Unknown food';
  const logDate = new Date(log.loggedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const displayMethods = log.servingMethods || [log.servingMethod];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-sage-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-sage-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-charcoal flex-1">Food Log</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sage-600 hover:text-sage-700 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Food Info Card */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="text-4xl">{RESPONSE_EMOJIS[log.response]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-charcoal">{foodName}</h2>
                {log.isFirstTime && (
                  <span className="text-xs bg-coral-100 text-coral-600 px-2 py-0.5 rounded-full">
                    First!
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {baby?.name} · {logDate}
                {log.mealTime && ` · ${MEAL_TIME_LABELS[log.mealTime]}`}
              </div>
            </div>
          </div>
        </Card>

        {/* Food Detail Link */}
        {food && (
          <Link
            to={`/foods/${food.id}`}
            className="flex items-center gap-2 p-3 bg-sage-50 rounded-xl border border-sage-200 hover:bg-sage-100 transition-colors"
          >
            <span className="text-xl">📖</span>
            <div className="flex-1">
              <div className="font-medium text-sage-700">View prep guide & tips</div>
              <div className="text-xs text-sage-600">
                {food.fun_fact ? food.fun_fact.slice(0, 50) + '...' : 'Learn about this food'}
              </div>
            </div>
            <svg className="w-5 h-5 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Edit Mode */}
        {isEditing ? (
          <Card className="space-y-4">
            <h3 className="font-semibold text-charcoal">Edit Log</h3>

            <ResponsePicker value={editResponse} onChange={setEditResponse} />

            <ServingMethodPicker value={editMethods} onChange={setEditMethods} />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">
                Meal (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealTime[]).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setEditMealTime(editMealTime === time ? undefined : time)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${editMealTime === time
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">
                Notes (optional)
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200
                         bg-white text-charcoal placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                         transition-colors resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!editResponse || editMethods.length === 0}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Details Card */}
            <Card className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Response</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{RESPONSE_EMOJIS[log.response]}</span>
                  <span className="text-charcoal">{RESPONSE_LABELS[log.response]}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Serving Style{displayMethods.length > 1 ? 's' : ''}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayMethods.map((method) => (
                    <span
                      key={method}
                      className="px-2 py-1 bg-sage-50 text-sage-700 rounded-full text-sm"
                    >
                      {SERVING_METHOD_LABELS[method]}
                    </span>
                  ))}
                </div>
              </div>

              {log.notes && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                  <div className="text-charcoal">{log.notes}</div>
                </div>
              )}

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Logged {new Date(log.createdAt).toLocaleString()}
              </div>
            </Card>

            {/* Allergen Info */}
            {food?.is_allergen && (
              <Card className="bg-coral-50 border-coral-200">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-coral-700">
                      Allergen: {food.allergen_type?.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-coral-600 mt-0.5">
                      Track exposure for allergen maintenance
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Delete Button */}
            <div className="pt-4">
              {showDeleteConfirm ? (
                <Card className="bg-red-50 border-red-200">
                  <p className="text-red-700 mb-3">Delete this log entry? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      Yes, Delete
                    </Button>
                    <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Delete this log
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
