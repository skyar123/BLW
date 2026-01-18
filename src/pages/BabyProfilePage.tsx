import { useParams, useNavigate } from 'react-router-dom';
import { BabyCard } from '../components/BabyProfile';
import { Button, Card } from '../components/ui';
import { useBabies } from '../hooks/useBabies';
import { useFeedingLogs } from '../hooks/useFeedingLogs';
import { formatBabyAgeDisplay, getPhaseLabel } from '../utils/ageCalculations';
import foodsData from '../data/foods.json';

export function BabyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBabyById } = useBabies();
  const { getLogsForBaby, getUniqueFoodsForBaby } = useFeedingLogs();

  const baby = id ? getBabyById(id) : undefined;

  if (!baby) {
    return (
      <div className="min-h-screen bg-cream p-4 flex items-center justify-center">
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-semibold mb-2">Baby not found</h2>
          <p className="text-gray-500 mb-4">
            This baby profile doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const logs = getLogsForBaby(baby.id);
  const uniqueFoods = getUniqueFoodsForBaby(baby.id);
  const { phase } = formatBabyAgeDisplay(baby.birthDate, baby.dueDate);

  // Calculate some stats
  const totalFoods = foodsData.foods.length;
  const foodsTriedCount = uniqueFoods.length;
  const percentageTried = Math.round((foodsTriedCount / totalFoods) * 100);

  // Get recent logs
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-sage-400 text-white p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Baby Card */}
        <div className="-mt-8">
          <BabyCard baby={baby} />
        </div>

        {/* Quick Stats */}
        <Card padding="md">
          <h3 className="font-semibold text-charcoal mb-3">Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-sage-50 rounded-xl">
              <div className="text-3xl font-bold text-sage-600">{foodsTriedCount}</div>
              <div className="text-sm text-gray-500">Foods Tried</div>
            </div>
            <div className="text-center p-3 bg-coral-50 rounded-xl">
              <div className="text-3xl font-bold text-coral-500">{percentageTried}%</div>
              <div className="text-sm text-gray-500">of Database</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-400 rounded-full transition-all duration-500"
                style={{ width: `${percentageTried}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Phase Info */}
        <Card padding="md">
          <h3 className="font-semibold text-charcoal mb-2">Current Phase</h3>
          <p className="text-sage-600 font-medium">{getPhaseLabel(phase)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {phase === 'phase_1' && 'Thick sticks and wedges for palmar grasp'}
            {phase === 'phase_2' && 'Smaller pieces as pincer grasp develops'}
            {phase === 'phase_3' && 'Self-feeding with variety of textures'}
          </p>
        </Card>

        {/* Recent Activity */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-charcoal">Recent Logs</h3>
            <Button
              size="sm"
              onClick={() => navigate(`/log/${baby.id}`)}
            >
              + Log Food
            </Button>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No foods logged yet. Start tracking!
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => {
                const food = log.foodId
                  ? foodsData.foods.find((f) => f.id === log.foodId)
                  : null;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-sage-50 last:border-0"
                  >
                    <div>
                      <span className="font-medium">
                        {food?.name || log.customFoodName}
                      </span>
                      {log.isFirstTime && (
                        <span className="ml-2 text-xs bg-coral-100 text-coral-600 px-2 py-0.5 rounded-full">
                          First!
                        </span>
                      )}
                    </div>
                    <span className="text-xl">
                      {log.response === 'loved' && '⭐'}
                      {log.response === 'meh' && '😐'}
                      {log.response === 'disliked' && '😖'}
                      {log.response === 'gagged' && '🤢'}
                      {log.response === 'refused' && '🚫'}
                      {log.response === 'possible_reaction' && '⚠️'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate(`/log/${baby.id}`)}
          >
            Log a Food
          </Button>
        </div>
      </div>
    </div>
  );
}
