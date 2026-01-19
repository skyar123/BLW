import type { BadgeProgress } from '../../hooks/useBadges';

interface BadgeDetailModalProps {
  badgeProgress: BadgeProgress;
  onClose: () => void;
}

export function BadgeDetailModal({ badgeProgress, onClose }: BadgeDetailModalProps) {
  const { badge, earned, earnedDate, progress, current, target } = badgeProgress;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`
          w-full max-w-sm rounded-3xl p-6 shadow-xl
          ${earned ? 'bg-gradient-to-br from-amber-50 to-white' : 'bg-white'}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Badge icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`
              w-28 h-28 rounded-full flex items-center justify-center
              ${earned ? 'bg-white shadow-lg' : 'bg-gray-100'}
            `}
          >
            <span className={`text-6xl ${earned ? '' : 'grayscale opacity-50'}`}>
              {badge.emoji}
            </span>
          </div>
        </div>

        {/* Badge name */}
        <h2 className="text-2xl font-bold text-center text-charcoal mb-2">
          {badge.name}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-4">{badge.description}</p>

        {/* Status */}
        {earned ? (
          <div className="bg-green-50 rounded-xl p-4 text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Badge Earned!
            </div>
            {earnedDate && (
              <p className="text-sm text-green-600">{formatDate(earnedDate)}</p>
            )}
            <p className="text-sm text-green-700 mt-2 italic">
              "{badge.celebration_message}"
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-medium">{current} / {target}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-3">
              {progress === 0
                ? 'Start working towards this badge!'
                : `${Math.round(progress)}% complete - keep going!`}
            </p>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-semibold bg-sage-500 text-white hover:bg-sage-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
