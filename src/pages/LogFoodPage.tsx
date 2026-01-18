import { useParams, useNavigate } from 'react-router-dom';
import { LogEntry } from '../components/FoodLog';

export function LogFoodPage() {
  const { babyId } = useParams<{ babyId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-sage-400 text-white p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <LogEntry
          preselectedBabyId={babyId}
          onComplete={() => navigate('/')}
        />
      </div>
    </div>
  );
}
