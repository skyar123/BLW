import type { FeedingResponse } from '../../types';
import { RESPONSE_EMOJIS, RESPONSE_LABELS } from '../../types';

interface ResponsePickerProps {
  value?: FeedingResponse;
  onChange: (response: FeedingResponse) => void;
  compact?: boolean;
}

const responses: FeedingResponse[] = [
  'loved',
  'meh',
  'disliked',
  'gagged',
  'refused',
  'possible_reaction',
];

export function ResponsePicker({ value, onChange, compact = false }: ResponsePickerProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {responses.map((response) => (
          <button
            key={response}
            type="button"
            onClick={() => onChange(response)}
            className={`
              px-2 py-1.5 rounded-lg border transition-all
              flex items-center gap-1 text-xs
              ${value === response
                ? 'border-sage-400 bg-sage-50 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-sage-50'
              }
              ${response === 'possible_reaction' && value === response
                ? 'border-coral-400 bg-coral-50'
                : ''
              }
            `}
          >
            <span className="text-base">{RESPONSE_EMOJIS[response]}</span>
            <span className="text-gray-600">{RESPONSE_LABELS[response]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal">
        How did it go?
      </label>
      <div className="grid grid-cols-3 gap-2">
        {responses.map((response) => (
          <button
            key={response}
            type="button"
            onClick={() => onChange(response)}
            className={`
              p-3 rounded-xl border-2 transition-all
              flex flex-col items-center gap-1
              ${value === response
                ? 'border-sage-400 bg-sage-50 shadow-sm'
                : 'border-transparent bg-white hover:bg-sage-50'
              }
              ${response === 'possible_reaction' && value === response
                ? 'border-coral-400 bg-coral-50'
                : ''
              }
            `}
          >
            <span className="text-2xl">{RESPONSE_EMOJIS[response]}</span>
            <span className="text-xs text-gray-600 text-center leading-tight">
              {RESPONSE_LABELS[response]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
