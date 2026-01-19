import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Badge } from '../../types';

interface BadgeCelebrationProps {
  badge: Badge;
  onDismiss: () => void;
}

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  const hasConfettiFired = useRef(false);

  useEffect(() => {
    if (hasConfettiFired.current) return;
    hasConfettiFired.current = true;

    // Fire confetti from both sides
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#98D8AA', '#87CEEB'],
      });

      // Right side
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#98D8AA', '#87CEEB'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-8 shadow-2xl animate-bounceIn">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-amber-600 mb-2">New Badge Earned!</p>
        </div>

        {/* Badge icon with glow */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
              <span className="text-7xl animate-bounce">{badge.emoji}</span>
            </div>
          </div>
        </div>

        {/* Badge name */}
        <h2 className="text-3xl font-bold text-center text-charcoal mb-3">
          {badge.name}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-4">{badge.description}</p>

        {/* Celebration message */}
        <div className="bg-amber-100 rounded-xl p-4 mb-6">
          <p className="text-center text-amber-800 font-medium italic">
            "{badge.celebration_message}"
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Awesome!
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
