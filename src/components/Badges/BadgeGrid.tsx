import { useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { BadgeDetailModal } from './BadgeDetailModal';
import type { BadgeProgress } from '../../hooks/useBadges';

interface BadgeGridProps {
  badges: BadgeProgress[];
  showLocked?: boolean;
}

type FilterType = 'all' | 'earned' | 'in_progress';

export function BadgeGrid({ badges, showLocked = true }: BadgeGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeProgress | null>(null);

  const filteredBadges = badges.filter((bp) => {
    if (filter === 'earned') return bp.earned;
    if (filter === 'in_progress') return !bp.earned && bp.progress > 0;
    if (!showLocked && !bp.earned && bp.progress === 0) return false;
    return true;
  });

  const earnedCount = badges.filter((bp) => bp.earned).length;
  const inProgressCount = badges.filter((bp) => !bp.earned && bp.progress > 0).length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-sage-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({badges.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'earned'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Earned ({earnedCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
      </div>

      {/* Badge grid */}
      {filteredBadges.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredBadges.map((bp) => (
            <BadgeCard
              key={bp.badge.id}
              badge={bp.badge}
              earned={bp.earned}
              earnedDate={bp.earnedDate}
              progress={bp.progress}
              current={bp.current}
              target={bp.target}
              onClick={() => setSelectedBadge(bp)}
              size="medium"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No badges in this category yet.</p>
          <p className="text-sm mt-1">Keep logging foods to earn badges!</p>
        </div>
      )}

      {/* Detail modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badgeProgress={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
