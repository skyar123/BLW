import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Button, Card, VideoLinkCard } from '../components/ui';
import { useBabiesFirestore } from '../hooks/useBabiesFirestore';
import { getCorrectedAgeDecimal, getCurrentPhase } from '../utils/ageCalculations';
import type { Food, Phase } from '../types';
import foodsData from '../data/foods.json';

const CATEGORY_EMOJIS: Record<string, string> = {
  fruit: '🍎',
  vegetable: '🥦',
  protein: '🍗',
  grain: '🍞',
  dairy: '🧀',
  legume: '🫘',
  other: '🍽️',
};

const CHOKING_RISK_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const IRON_COLORS: Record<string, string> = {
  high: 'bg-sage-100 text-sage-700',
  medium: 'bg-sage-50 text-sage-600',
  low: 'bg-gray-100 text-gray-600',
  none: 'bg-gray-50 text-gray-500',
};

export function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const { babies } = useBabiesFirestore();

  const foods = foodsData.foods as Food[];
  const food = useMemo(() => foods.find((f) => f.id === foodId), [foods, foodId]);

  // Use the first baby for now (could be enhanced with baby selector)
  const activeBaby = babies.length > 0 ? babies[0] : null;

  const currentPhase: Phase | null = useMemo(() => {
    if (!activeBaby) return null;
    const ageMonths = getCorrectedAgeDecimal(activeBaby.birthDate, activeBaby.dueDate);
    return getCurrentPhase(ageMonths);
  }, [activeBaby]);

  if (!food) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-6xl mb-4">🤷</div>
          <h1 className="text-xl font-bold text-charcoal mb-2">Food not found</h1>
          <p className="text-gray-600 mb-4">We couldn't find that food in our database.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const prepGuide = currentPhase ? food.prep_guides[currentPhase] : food.prep_guides.phase_1;

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
          <h1 className="text-lg font-semibold text-charcoal flex-1 truncate">
            {food.name}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Food Header Card */}
        <Card className="text-center py-6">
          <div className="text-5xl mb-3">{CATEGORY_EMOJIS[food.category] || '🍽️'}</div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">{food.name}</h2>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-sage-100 text-sage-700 capitalize">
              {food.category}
            </span>

            {food.is_allergen && (
              <span className="text-xs px-2 py-1 rounded-full bg-coral-100 text-coral-700">
                ⚠️ Allergen ({food.allergen_type})
              </span>
            )}

            <span className={`text-xs px-2 py-1 rounded-full ${CHOKING_RISK_COLORS[food.choking_risk]}`}>
              {food.choking_risk === 'high' && '⚠️ '}
              Choking risk: {food.choking_risk}
            </span>

            <span className={`text-xs px-2 py-1 rounded-full ${IRON_COLORS[food.iron_content]}`}>
              🔩 Iron: {food.iron_content}
            </span>

            {food.vitamin_c_rich && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                🍊 Vitamin C rich
              </span>
            )}

            {food.omega_3_rich && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                🐟 Omega-3 rich
              </span>
            )}
          </div>
        </Card>

        {/* Fun Fact */}
        {food.fun_fact && (
          <Card className="bg-gradient-to-br from-sage-50 to-sage-100 border-sage-200">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-semibold text-sage-800 mb-1">Did you know?</div>
                <p className="text-sage-700">{food.fun_fact}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Prep Guide */}
        {prepGuide && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">👨‍🍳</span>
              <h3 className="font-semibold text-charcoal">
                How to Prepare
                {currentPhase && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Phase {currentPhase.replace('phase_', '')})
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shape</div>
                <div className="font-medium text-charcoal">{prepGuide.shape}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Preparation</div>
                <div className="text-charcoal">{prepGuide.preparation}</div>
              </div>

              {prepGuide.serving_tip && (
                <div className="bg-sage-50 rounded-lg p-3">
                  <div className="text-xs text-sage-600 uppercase tracking-wide mb-1">💡 Tip</div>
                  <div className="text-sage-700">{prepGuide.serving_tip}</div>
                </div>
              )}

              {prepGuide.safety_note && (
                <div className="bg-coral-50 rounded-lg p-3">
                  <div className="text-xs text-coral-600 uppercase tracking-wide mb-1">⚠️ Safety</div>
                  <div className="text-coral-700">{prepGuide.safety_note}</div>
                </div>
              )}
            </div>

            {/* Show other phases */}
            {!currentPhase && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Add a baby to see age-appropriate prep guides
                </p>
              </div>
            )}
          </Card>
        )}

        {/* All Phase Guides (if no active baby) */}
        {!currentPhase && Object.keys(food.prep_guides).length > 1 && (
          <Card>
            <h3 className="font-semibold text-charcoal mb-4">All Prep Guides by Phase</h3>
            <div className="space-y-4">
              {food.prep_guides.phase_1 && (
                <div className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="text-sm font-medium text-sage-600 mb-1">Phase 1 (6-7 months)</div>
                  <div className="text-sm text-charcoal">{food.prep_guides.phase_1.shape}</div>
                </div>
              )}
              {food.prep_guides.phase_2 && (
                <div className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="text-sm font-medium text-sage-600 mb-1">Phase 2 (8-9 months)</div>
                  <div className="text-sm text-charcoal">{food.prep_guides.phase_2.shape}</div>
                </div>
              )}
              {food.prep_guides.phase_3 && (
                <div className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="text-sm font-medium text-sage-600 mb-1">Phase 3 (10-12 months)</div>
                  <div className="text-sm text-charcoal">{food.prep_guides.phase_3.shape}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Video Links */}
        {food.video_links && food.video_links.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎬</span>
              <h3 className="font-semibold text-charcoal">Watch & Learn</h3>
            </div>
            <div className="space-y-2">
              {food.video_links.map((video, index) => (
                <VideoLinkCard key={index} video={video} />
              ))}
            </div>
          </Card>
        )}

        {/* Log This Food Button */}
        <div className="sticky bottom-4">
          <Link to={activeBaby ? `/log/${activeBaby.id}?food=${food.id}` : '/log'}>
            <Button className="w-full shadow-lg">
              Log {food.name}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
