import { useNavigate, useParams } from 'react-router-dom';
import { useBadges } from '../hooks/useBadges';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import { BadgeGrid } from '../components/Badges';

export function BadgesPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId?: string }>();
  const { babies } = useBabiesFirestore();

  // If no babyId provided, use the first baby
  const selectedBabyId = babyId || babies[0]?.id;
  const selectedBaby = babies.find((b) => b.id === selectedBabyId);

  const { badgeProgress, stats, loading } = useBadges(selectedBabyId);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-bounce text-4xl">🏆</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-charcoal">Badges</h1>
              {selectedBaby && (
                <p className="text-sm text-gray-500">{selectedBaby.name}'s achievements</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Baby selector if multiple babies */}
        {babies.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => navigate(`/badges/${baby.id}`)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  baby.id === selectedBabyId
                    ? 'bg-sage-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-sage-300'
                }`}
              >
                {baby.name}
              </button>
            ))}
          </div>
        )}

        {/* Stats summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold text-charcoal">{stats.earnedCount}</p>
              <p className="text-gray-500">badges earned</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-400">/ {stats.totalCount}</p>
              <p className="text-sm text-gray-400">{stats.completionPercentage}% complete</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>

          {/* Next badge hint */}
          {stats.nextBadge && (
            <div className="mt-4 p-3 bg-sage-50 rounded-xl flex items-center gap-3">
              <span className="text-2xl">{stats.nextBadge.badge.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">
                  Next: {stats.nextBadge.badge.name}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.nextBadge.current}/{stats.nextBadge.target} ({Math.round(stats.nextBadge.progress)}%)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Badge grid */}
        <section>
          <h2 className="text-lg font-semibold text-charcoal mb-4">All Badges</h2>
          <BadgeGrid badges={badgeProgress} showLocked={true} />
        </section>
      </main>
    </div>
  );
}
