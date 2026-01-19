import { useNavigate } from 'react-router-dom';
import { useUniqueFoods } from '../../hooks/useUniqueFoods';

interface FoodsChallengeProps {
  babyId: string;
  compact?: boolean;
}

export function FoodsChallenge({ babyId, compact = false }: FoodsChallengeProps) {
  const navigate = useNavigate();
  const { stats, milestones, categoryBreakdown } = useUniqueFoods(babyId);

  const progressPercentage = (stats.total / 100) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/progress/${babyId}`)}
        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow w-full text-left"
      >
        <div className="flex items-center gap-4">
          {/* Mini circular progress */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#98D8AA"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 - (progressPercentage / 100) * 2 * Math.PI * 28}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-charcoal">{stats.total}</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-charcoal">100 Foods Challenge</h3>
            <p className="text-sm text-gray-500">
              {milestones.nextMilestone
                ? `${milestones.nextMilestone - stats.total} to go until ${milestones.nextMilestone}`
                : 'Challenge complete!'}
            </p>
          </div>

          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-charcoal mb-4 text-center">
        100 Foods Challenge
      </h2>

      {/* Circular progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#98D8AA" />
                <stop offset="100%" stopColor="#7BC796" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-charcoal">{stats.total}</span>
            <span className="text-sm text-gray-500">/ 100 foods</span>
          </div>
        </div>
      </div>

      {/* Milestone markers */}
      <div className="flex justify-between px-2 mb-6">
        {[25, 50, 75, 100].map((milestone) => {
          const reached = stats.total >= milestone;
          return (
            <div
              key={milestone}
              className={`flex flex-col items-center ${
                reached ? 'text-sage-600' : 'text-gray-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  reached
                    ? 'bg-sage-100 text-sage-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {reached ? '✓' : milestone}
              </div>
              <span className="text-xs mt-1">{milestone}</span>
            </div>
          );
        })}
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 mb-2">By Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {categoryBreakdown
            .filter((c) => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((category) => (
              <div
                key={category.category}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="text-sm text-gray-600 flex-1">{category.label}</span>
                <span className="text-sm font-semibold text-charcoal">{category.count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Recent foods */}
      {stats.recentFoods.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Recently Added</h3>
          <div className="flex flex-wrap gap-2">
            {stats.recentFoods.map((food) => (
              <span
                key={food.foodId}
                className="px-3 py-1 bg-sage-50 text-sage-700 text-sm rounded-full"
              >
                {food.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
