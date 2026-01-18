import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useBabies } from '../hooks/useBabies';
import { useAllergenTracker, type AllergenStatus } from '../hooks/useAllergenTracker';
import type { AllergenType, ReactionSeverity } from '../types';
import { ALLERGEN_LABELS } from '../types';
import foodsData from '../data/foods.json';

const ALLERGEN_EMOJIS: Record<AllergenType, string> = {
  peanut: '🥜',
  tree_nut: '🌰',
  egg: '🥚',
  dairy: '🥛',
  wheat: '🌾',
  soy: '🫘',
  fish: '🐟',
  shellfish: '🦐',
  sesame: '🫓',
};

const STATUS_COLORS: Record<AllergenStatus['status'], string> = {
  not_introduced: 'bg-gray-100 text-gray-600',
  introduced: 'bg-blue-100 text-blue-700',
  cleared: 'bg-green-100 text-green-700',
  reaction: 'bg-red-100 text-red-700',
};

const URGENCY_COLORS: Record<AllergenStatus['maintenanceUrgency'], string> = {
  ok: 'text-green-600',
  soon: 'text-yellow-600',
  overdue: 'text-red-600',
};

export function AllergenTrackerPage() {
  const navigate = useNavigate();
  const { babies } = useBabies();
  const {
    getAllAllergenStatuses,
    getMaintenanceReminders,
    recordReaction,
    markAsCleared,
    clearReaction,
    getStats,
  } = useAllergenTracker();

  const [selectedBabyId, setSelectedBabyId] = useState<string>(babies[0]?.id || '');
  const [showReactionModal, setShowReactionModal] = useState<AllergenType | null>(null);
  const [reactionSeverity, setReactionSeverity] = useState<ReactionSeverity>('mild');
  const [reactionNotes, setReactionNotes] = useState('');

  const selectedBaby = babies.find((b) => b.id === selectedBabyId);
  const allergenStatuses = selectedBabyId ? getAllAllergenStatuses(selectedBabyId) : [];
  const maintenanceReminders = selectedBabyId ? getMaintenanceReminders(selectedBabyId) : [];
  const stats = selectedBabyId ? getStats(selectedBabyId) : null;

  // Get food recommendations for an allergen type
  const getFoodsForAllergen = (allergenType: AllergenType) => {
    return (foodsData.foods as Array<{ id: string; name: string; allergen_type?: string }>).filter(
      (f) => f.allergen_type === allergenType
    );
  };

  const handleRecordReaction = () => {
    if (!selectedBabyId || !showReactionModal) return;
    recordReaction(selectedBabyId, showReactionModal, reactionSeverity, reactionNotes || undefined);
    setShowReactionModal(null);
    setReactionSeverity('mild');
    setReactionNotes('');
  };

  if (babies.length === 0) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-charcoal mb-2">No babies yet</h1>
          <p className="text-gray-600 mb-4">Add a baby to start tracking allergens.</p>
          <Button onClick={() => navigate('/babies/new')}>Add Baby</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-coral-400 text-white">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-coral-500 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Allergen Tracker</h1>
              <p className="text-coral-100 text-sm">Top 9 allergens</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Baby Selector */}
        {babies.length > 1 && (
          <div className="flex gap-2">
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => setSelectedBabyId(baby.id)}
                className={`
                  flex-1 px-4 py-2 rounded-full border-2 font-medium transition-all
                  ${selectedBabyId === baby.id
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {baby.name}
              </button>
            ))}
          </div>
        )}

        {/* Maintenance Reminders */}
        {maintenanceReminders.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Maintenance Needed</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Re-expose to maintain tolerance (every 3-7 days):
                </p>
                <div className="mt-2 space-y-1">
                  {maintenanceReminders.map((reminder) => (
                    <div
                      key={reminder.allergenType}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span>{ALLERGEN_EMOJIS[reminder.allergenType]}</span>
                        <span className="text-yellow-800">{ALLERGEN_LABELS[reminder.allergenType]}</span>
                      </span>
                      <span className={URGENCY_COLORS[reminder.maintenanceUrgency]}>
                        {reminder.daysSinceExposure} days ago
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Summary */}
        {stats && (
          <Card padding="md">
            <h3 className="font-semibold text-charcoal mb-3">
              {selectedBaby?.name}'s Progress
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{stats.introduced}</div>
                <div className="text-xs text-gray-500">Trying</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{stats.cleared}</div>
                <div className="text-xs text-gray-500">Cleared</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stats.reactions}</div>
                <div className="text-xs text-gray-500">Reactions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-400">{stats.notIntroduced}</div>
                <div className="text-xs text-gray-500">Not Started</div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500"
                style={{ width: `${(stats.cleared / stats.total) * 100}%` }}
              />
              <div
                className="bg-blue-500"
                style={{ width: `${(stats.introduced / stats.total) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(stats.reactions / stats.total) * 100}%` }}
              />
            </div>
          </Card>
        )}

        {/* Allergen List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-charcoal">All Allergens</h3>
          {allergenStatuses.map((status) => {
            const foods = getFoodsForAllergen(status.allergenType);
            return (
              <Card key={status.allergenType} padding="md">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{ALLERGEN_EMOJIS[status.allergenType]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-charcoal">
                        {ALLERGEN_LABELS[status.allergenType]}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status.status]}`}>
                        {status.status === 'not_introduced' && 'Not started'}
                        {status.status === 'introduced' && 'In progress'}
                        {status.status === 'cleared' && 'Cleared ✓'}
                        {status.status === 'reaction' && 'Reaction ⚠️'}
                      </span>
                    </div>

                    {/* Exposure info */}
                    {status.exposureCount > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {status.exposureCount} exposure{status.exposureCount !== 1 ? 's' : ''}
                        {status.daysSinceExposure !== undefined && (
                          <span className={`ml-2 ${URGENCY_COLORS[status.maintenanceUrgency]}`}>
                            · Last: {status.daysSinceExposure === 0 ? 'Today' : `${status.daysSinceExposure}d ago`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reaction info */}
                    {status.hadReaction && (
                      <div className="text-sm text-red-600 mt-1">
                        Reaction: {status.reactionSeverity}
                        {status.reactionNotes && ` - ${status.reactionNotes}`}
                      </div>
                    )}

                    {/* Food suggestions */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {foods.slice(0, 3).map((food) => (
                        <Link
                          key={food.id}
                          to={`/foods/${food.id}`}
                          className="text-xs px-2 py-1 bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100"
                        >
                          {food.name}
                        </Link>
                      ))}
                      {foods.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-400">
                          +{foods.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {status.status === 'not_introduced' && (
                        <Link
                          to={`/log?allergen=${status.allergenType}`}
                          className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        >
                          Start Introduction
                        </Link>
                      )}
                      {status.status === 'introduced' && (
                        <>
                          <button
                            onClick={() => markAsCleared(selectedBabyId, status.allergenType)}
                            className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600"
                          >
                            Mark Cleared
                          </button>
                          <button
                            onClick={() => setShowReactionModal(status.allergenType)}
                            className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                          >
                            Record Reaction
                          </button>
                        </>
                      )}
                      {status.status === 'reaction' && (
                        <button
                          onClick={() => clearReaction(selectedBabyId, status.allergenType)}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                        >
                          Clear Reaction
                        </button>
                      )}
                      {status.status === 'cleared' && status.needsMaintenance && (
                        <Link
                          to={`/log?allergen=${status.allergenType}`}
                          className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                        >
                          Log Maintenance
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-sage-50 border-sage-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-sage-700">
              <p className="font-semibold mb-1">Early Introduction Tips</p>
              <ul className="list-disc list-inside space-y-1 text-sage-600">
                <li>Introduce allergens between 4-11 months</li>
                <li>Start with small amounts (1/4 tsp)</li>
                <li>Re-expose every 3-7 days to maintain tolerance</li>
                <li>Watch for reactions for 2 hours after</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>

      {/* Reaction Modal */}
      {showReactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card padding="lg" className="w-full max-w-sm">
            <h3 className="font-bold text-lg text-charcoal mb-4">
              Record Reaction to {ALLERGEN_LABELS[showReactionModal]}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Severity
                </label>
                <div className="flex gap-2">
                  {(['mild', 'moderate', 'severe'] as ReactionSeverity[]).map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setReactionSeverity(severity)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium capitalize
                        ${reactionSeverity === severity
                          ? severity === 'severe'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : severity === 'moderate'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={reactionNotes}
                  onChange={(e) => setReactionNotes(e.target.value)}
                  placeholder="Describe the reaction..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRecordReaction} className="flex-1 bg-red-500 hover:bg-red-600">
                  Record Reaction
                </Button>
                <Button variant="ghost" onClick={() => setShowReactionModal(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
