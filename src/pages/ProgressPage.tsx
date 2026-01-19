import { useNavigate, useParams } from 'react-router-dom';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import { useBadges } from '../hooks/useBadges';
import { FoodsChallenge } from '../components/Progress/FoodsChallenge';
import { PalateRadar } from '../components/Progress/PalateRadar';
import { BadgeCard } from '../components/Badges/BadgeCard';

export function ProgressPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId?: string }>();
  const { babies } = useBabiesFirestore();

  const selectedBabyId = babyId || babies[0]?.id;
  const selectedBaby = babies.find((b) => b.id === selectedBabyId);

  const { badgeProgress, stats } = useBadges(selectedBabyId);

  // Get recently earned badges (last 5)
  const recentBadges = badgeProgress
    .filter((bp) => bp.earned)
    .sort((a, b) => {
      if (!a.earnedDate || !b.earnedDate) return 0;
      return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
    })
    .slice(0, 5);

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
              <h1 className="text-xl font-bold text-charcoal">Progress</h1>
              {selectedBaby && (
                <p className="text-sm text-gray-500">{selectedBaby.name}'s journey</p>
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
                onClick={() => navigate(`/progress/${baby.id}`)}
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

        {/* 100 Foods Challenge */}
        {selectedBabyId && <FoodsChallenge babyId={selectedBabyId} />}

        {/* Palate Radar */}
        {selectedBabyId && <PalateRadar babyId={selectedBabyId} size="medium" />}

        {/* Badges section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Badges</h2>
            <button
              onClick={() => navigate(`/badges/${selectedBabyId}`)}
              className="text-sm text-sage-600 font-medium hover:text-sage-700"
            >
              View all →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-2xl font-bold text-charcoal">
                  {stats.earnedCount} / {stats.totalCount}
                </p>
                <p className="text-sm text-gray-500">badges earned</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>

            {/* Recent badges or next badge */}
            {recentBadges.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">Recently earned</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {recentBadges.map((bp) => (
                    <BadgeCard
                      key={bp.badge.id}
                      badge={bp.badge}
                      earned={true}
                      earnedDate={bp.earnedDate}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            ) : stats.nextBadge ? (
              <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                <span className="text-3xl">{stats.nextBadge.badge.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">
                    {stats.nextBadge.badge.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.nextBadge.current}/{stats.nextBadge.target}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-sage-600">
                    {Math.round(stats.nextBadge.progress)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Start logging foods to earn badges!
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
