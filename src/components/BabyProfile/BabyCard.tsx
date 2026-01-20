import { useState } from 'react';
import { Card } from '../ui';
import { EditBabyModal } from './EditBabyModal';
import type { Baby } from '../../types';
import { formatBabyAgeDisplay, getPhaseLabel } from '../../utils/ageCalculations';

interface BabyCardProps {
  baby: Baby;
  onClick?: () => void;
  showPhase?: boolean;
  showEditButton?: boolean;
}

export function BabyCard({ baby, onClick, showPhase = true, showEditButton = false }: BabyCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { chronological, corrected, phase } = formatBabyAgeDisplay(
    baby.birthDate,
    baby.dueDate
  );

  const phaseColors = {
    phase_1: 'bg-sage-100 text-sage-700',
    phase_2: 'bg-coral-100 text-coral-700',
    phase_3: 'bg-amber-100 text-amber-700',
  };

  return (
    <Card
      variant="elevated"
      padding="md"
      className={`${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
          {baby.photoUrl ? (
            <img
              src={baby.photoUrl}
              alt={baby.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl">👶</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-charcoal truncate">
            {baby.name}
          </h3>

          {/* Age display */}
          <div className="mt-1 space-y-0.5">
            <p className="text-gray-600">
              {chronological}
              {corrected && (
                <span className="text-sage-600 font-medium">
                  {' '}({corrected} adjusted)
                </span>
              )}
            </p>

            {baby.wasPremature && baby.gestationalWeeks && (
              <p className="text-sm text-gray-500">
                Born at {baby.gestationalWeeks} weeks
              </p>
            )}
          </div>

          {/* Phase badge */}
          {showPhase && (
            <div className="mt-2">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${phaseColors[phase]}`}
              >
                {getPhaseLabel(phase)}
              </span>
            </div>
          )}
        </div>

        {/* Arrow indicator if clickable */}
        {onClick && (
          <div className="text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>

      {baby.notes && (
        <p className="mt-3 pt-3 border-t border-sage-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {baby.notes}
        </p>
      )}

      {/* Edit Button */}
      {showEditButton && (
        <div className="mt-3 pt-3 border-t border-sage-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(true);
            }}
            className="w-full py-2 text-sm font-medium text-sage-600 dark:text-sage-400
                     hover:bg-sage-50 dark:hover:bg-gray-700 rounded-lg transition-colors
                     flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditBabyModal
        baby={baby}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </Card>
  );
}
