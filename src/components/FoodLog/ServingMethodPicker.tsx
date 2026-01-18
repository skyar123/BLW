import type { ServingMethod } from '../../types';
import { SERVING_METHOD_LABELS } from '../../types';

interface ServingMethodPickerProps {
  value?: ServingMethod[];
  onChange: (methods: ServingMethod[]) => void;
}

const methods: ServingMethod[] = [
  'stick',
  'mashed',
  'bite_sized',
  'preloaded_spoon',
  'whole',
  'other',
];

const methodEmojis: Record<ServingMethod, string> = {
  stick: '📏',
  mashed: '🥣',
  bite_sized: '🤏',
  preloaded_spoon: '🥄',
  whole: '🍎',
  other: '🍽️',
};

export function ServingMethodPicker({ value = [], onChange }: ServingMethodPickerProps) {
  const toggleMethod = (method: ServingMethod) => {
    if (value.includes(method)) {
      onChange(value.filter((m) => m !== method));
    } else {
      onChange([...value, method]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal">
        Serving Style(s)
        <span className="font-normal text-gray-400 ml-1">(select all that apply)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => toggleMethod(method)}
            className={`
              px-3 py-2 rounded-full border transition-all
              flex items-center gap-1.5 text-sm
              ${value.includes(method)
                ? 'border-sage-400 bg-sage-50 text-sage-700'
                : 'border-sage-200 bg-white text-gray-600 hover:bg-sage-50'
              }
            `}
          >
            <span>{methodEmojis[method]}</span>
            <span>{SERVING_METHOD_LABELS[method]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
