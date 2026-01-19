import type { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  current?: number;
  target?: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function BadgeCard({
  badge,
  earned,
  earnedDate,
  progress = 0,
  current = 0,
  target = 1,
  onClick,
  size = 'medium',
}: BadgeCardProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const emojiSizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center p-3 rounded-2xl transition-all
        ${earned
          ? 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-lg border-2 border-amber-200'
          : 'bg-gray-100 opacity-60 hover:opacity-80 border-2 border-gray-200'
        }
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
      `}
    >
      {/* Badge icon */}
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center rounded-full mb-2
          ${earned ? 'bg-white shadow-inner' : 'bg-gray-200'}
        `}
      >
        <span className={`${emojiSizes[size]} ${earned ? '' : 'grayscale'}`}>
          {badge.emoji}
        </span>
      </div>

      {/* Badge name */}
      <h3
        className={`
          font-semibold text-center leading-tight
          ${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'}
          ${earned ? 'text-charcoal' : 'text-gray-500'}
        `}
      >
        {badge.name}
      </h3>

      {/* Progress or earned date */}
      {earned && earnedDate ? (
        <p className="text-xs text-amber-600 mt-1">{formatDate(earnedDate)}</p>
      ) : !earned && progress > 0 ? (
        <div className="w-full mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            {current}/{target}
          </p>
        </div>
      ) : null}

      {/* Earned checkmark */}
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
