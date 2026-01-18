import type { VideoLink } from '../../types';

interface VideoLinkCardProps {
  video: VideoLink;
}

const SOURCE_COLORS: Record<string, string> = {
  'Solid Starts': 'bg-orange-100 text-orange-700',
  'Feeding Littles': 'bg-purple-100 text-purple-700',
  '101 Before One': 'bg-blue-100 text-blue-700',
  'Kids Eat in Color': 'bg-green-100 text-green-700',
  'Tiny Hearts Education': 'bg-red-100 text-red-700',
  'Baby Led Weaning Team': 'bg-yellow-100 text-yellow-700',
};

const TYPE_ICONS: Record<string, string> = {
  prep: '🔪',
  demo: '👶',
  safety: '⚠️',
  educational: '📚',
};

export function VideoLinkCard({ video }: VideoLinkCardProps) {
  const sourceColor = SOURCE_COLORS[video.source] || 'bg-gray-100 text-gray-700';

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sage-200 hover:border-sage-400 hover:shadow-sm transition-all"
    >
      {/* Icon */}
      <div className="text-2xl flex-shrink-0">
        {TYPE_ICONS[video.type] || '🎬'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-charcoal truncate">
          {video.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColor}`}>
            {video.source}
          </span>
          {video.duration && (
            <span className="text-xs text-gray-500">
              {video.duration}
            </span>
          )}
        </div>
      </div>

      {/* External link indicator */}
      <div className="text-gray-400 flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}
