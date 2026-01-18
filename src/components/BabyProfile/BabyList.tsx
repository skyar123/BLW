import { BabyCard } from './BabyCard';
import { Button } from '../ui';
import type { Baby } from '../../types';

interface BabyListProps {
  babies: Baby[];
  onBabyClick?: (baby: Baby) => void;
  onAddClick?: () => void;
}

export function BabyList({ babies, onBabyClick, onAddClick }: BabyListProps) {
  if (babies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👶</div>
        <h3 className="text-xl font-semibold text-charcoal mb-2">
          No babies yet
        </h3>
        <p className="text-gray-500 mb-6">
          Add your first baby to start tracking their food journey
        </p>
        {onAddClick && (
          <Button onClick={onAddClick} size="lg">
            Add Your First Baby
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {babies.map((baby) => (
        <BabyCard
          key={baby.id}
          baby={baby}
          onClick={onBabyClick ? () => onBabyClick(baby) : undefined}
        />
      ))}

      {onAddClick && (
        <Button
          variant="secondary"
          onClick={onAddClick}
          className="w-full"
        >
          + Add Another Baby
        </Button>
      )}
    </div>
  );
}
