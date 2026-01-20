import { useNavigate, Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { BabyList } from '../components/BabyProfile';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import { useFeedingLogsFirestore } from '../hooks/useFeedingLogsFirestore';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useBadges } from '../hooks/useBadges';
import { useUniqueFoods } from '../hooks/useUniqueFoods';
import { useStreaks } from '../hooks/useStreaks';
import { FoodsChallenge } from '../components/Progress/FoodsChallenge';
import { BadgeCelebration } from '../components/Badges/BadgeCelebration';
import { MealSuggestions } from '../components/MealSuggestions';
import { OnboardingTour, useOnboarding } from '../components/Onboarding';
import { exportAndDownload } from '../utils/exportData';
import foodsData from '../data/foods.json';
import type { Baby } from '../types';
import { RESPONSE_EMOJIS } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const { babies, hasBabies, loading: babiesLoading } = useBabiesFirestore();
  const { getTodaysLogs, totalLogs, loading: logsLoading } = useFeedingLogsFirestore();

  // Use first baby for badges/progress (user can switch on detail pages)
  const firstBabyId = babies[0]?.id;
  const { stats: badgeStats, newlyEarnedBadge, dismissCelebration } = useBadges(firstBabyId);
  const { totalUnique } = useUniqueFoods(firstBabyId);
  const { currentStreak, isActiveToday } = useStreaks(firstBabyId);
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { logs } = useFeedingLogsFirestore();

  const todaysLogs = getTodaysLogs();

  const handleExport = () => {
    exportAndDownload(logs, babies);
  };

  const handleBabyClick = (baby: Baby) => {
    navigate(`/babies/${baby.id}`);
  };

  // Show loading state while data is being fetched
  if (familyLoading || babiesLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🥑</div>
          <p className="text-gray-500">Loading your family's data...</p>
        </div>
      </div>
    );
  }

  // Welcome screen for new users
  if (!hasBabies) {
    return (
      <div className="min-h-screen bg-cream">
        {/* Header with user info */}
        <div className="bg-sage-400 text-white p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">First Bites</h1>
              <p className="text-sage-100 text-sm">{family?.name}</p>
            </div>
            <Link
              to="/settings/family"
              className="p-2 hover:bg-sage-500 rounded-full transition-colors"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center">
                  <span>👤</span>
                </div>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Card padding="lg" className="max-w-md text-center">
            <div className="text-6xl mb-4">🥑</div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">
              Welcome to First Bites!
            </h1>
            <p className="text-gray-600 mb-6">
              Your family's baby-led weaning journal. Track firsts, celebrate progress,
              and remember every messy, magical moment.
            </p>
            <Button onClick={() => navigate('/babies/new')} size="lg" className="w-full">
              Add Your Baby
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-sage-400 text-white p-4 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">First Bites</h1>
              <p className="text-sage-100 text-sm">{family?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/settings/family"
                className="p-2 hover:bg-sage-500 rounded-full transition-colors"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center">
                    <span>👤</span>
                  </div>
                )}
              </Link>
            </div>
          </div>
          <p className="text-sage-100 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 -mt-4 space-y-6">
        {/* Quick Log Button */}
        <Button
          onClick={() => navigate('/log')}
          size="lg"
          className="w-full shadow-lg"
        >
          + Log a Food
        </Button>

        {/* Today's Summary */}
        <Card padding="md">
          <h2 className="font-semibold text-charcoal mb-3">Today</h2>
          {todaysLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No foods logged yet today
            </p>
          ) : (
            <div className="space-y-1">
              {todaysLogs.map((log) => {
                const food = log.foodId
                  ? foodsData.foods.find((f) => f.id === log.foodId)
                  : null;
                const baby = babies.find((b) => b.id === log.babyId);
                return (
                  <Link
                    key={log.id}
                    to={`/logs/${log.id}`}
                    className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-sage-50 transition-colors border-b border-sage-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-sage-600">
                        {baby?.name}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span>{food?.name || log.customFoodName}</span>
                      {log.isFirstTime && (
                        <span className="text-xs bg-coral-100 text-coral-600 px-2 py-0.5 rounded-full">
                          First!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{RESPONSE_EMOJIS[log.response]}</span>
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Babies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal">Your Babies</h2>
            {babies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/babies/new')}
              >
                + Add
              </Button>
            )}
          </div>
          <BabyList
            babies={babies}
            onBabyClick={handleBabyClick}
            onAddClick={() => navigate('/babies/new')}
          />
        </div>

        {/* Progress & Badges Quick Links */}
        {firstBabyId && (
          <div className="grid grid-cols-2 gap-3">
            {/* 100 Foods Progress */}
            <Link to={`/progress/${firstBabyId}`}>
              <Card padding="md" className="h-full hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sage-600">{totalUnique}</div>
                  <div className="text-xs text-gray-500">/ 100 Foods</div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-500 rounded-full transition-all"
                      style={{ width: `${Math.min(totalUnique, 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            </Link>

            {/* Badges */}
            <Link to={`/badges/${firstBabyId}`}>
              <Card padding="md" className="h-full hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">{badgeStats.earnedCount}</div>
                  <div className="text-xs text-gray-500">/ {badgeStats.totalCount} Badges</div>
                  <div className="mt-2 flex justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Allergen Tracker */}
        <Card padding="md" className="bg-coral-50 border-coral-200">
          <Link to="/allergens" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥜</span>
              <div>
                <h2 className="font-semibold text-charcoal">Allergen Tracker</h2>
                <p className="text-sm text-gray-500">Track top 9 allergens & maintenance</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-coral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Card>

        {/* 100 Foods Challenge (compact) */}
        {firstBabyId && <FoodsChallenge babyId={firstBabyId} compact />}

        {/* Stats with Streak */}
        {totalLogs > 0 && (
          <Card padding="md">
            <h2 className="font-semibold text-charcoal dark:text-white mb-3">Journey Stats</h2>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-sage-600">{totalLogs}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Logs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-coral-500">{totalUnique}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Foods</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-500">{badgeStats.earnedCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Badges</div>
              </div>
              <div>
                <div className={`text-xl font-bold ${isActiveToday ? 'text-orange-500' : 'text-gray-400'}`}>
                  {currentStreak}🔥
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
              </div>
              <div>
                <div className="text-xl font-bold text-sage-600">
                  {todaysLogs.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
              </div>
            </div>
          </Card>
        )}

        {/* Meal Suggestions */}
        {firstBabyId && <MealSuggestions babyId={firstBabyId} limit={3} />}

        {/* Quick Links - Growth, Shopping, Export */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/growth">
            <Card padding="sm" className="text-center hover:shadow-md transition-shadow">
              <span className="text-2xl">📏</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Growth</p>
            </Card>
          </Link>
          <Link to="/shopping">
            <Card padding="sm" className="text-center hover:shadow-md transition-shadow">
              <span className="text-2xl">🛒</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Shopping</p>
            </Card>
          </Link>
          <button onClick={handleExport}>
            <Card padding="sm" className="text-center hover:shadow-md transition-shadow w-full">
              <span className="text-2xl">📤</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Export</p>
            </Card>
          </button>
        </div>

        {/* Badge Celebration Modal */}
        {newlyEarnedBadge && (
          <BadgeCelebration badge={newlyEarnedBadge} onDismiss={dismissCelebration} />
        )}

        {/* Onboarding Tour */}
        {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}
      </div>
    </div>
  );
}
