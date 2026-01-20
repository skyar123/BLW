import { useState, useEffect } from 'react';
import { Button, Card } from '../ui';

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
}

const steps: OnboardingStep[] = [
  {
    emoji: '👋',
    title: 'Welcome to First Bites!',
    description: 'Track your baby\'s food journey with ease. Log meals, earn badges, and watch their palate grow!',
  },
  {
    emoji: '👶',
    title: 'Add Your Baby',
    description: 'Start by adding your little one. We\'ll calculate their age and BLW phase automatically.',
  },
  {
    emoji: '🍎',
    title: 'Log Foods Daily',
    description: 'Track what they try, how they liked it, and how you served it. First-time foods get a special celebration!',
  },
  {
    emoji: '🏆',
    title: 'Earn Badges',
    description: 'Hit milestones like "First Bite", "Rainbow Week", and "100 Foods Club" to track your journey.',
  },
  {
    emoji: '🥜',
    title: 'Track Allergens',
    description: 'Keep track of the top 9 allergens and get reminders for maintenance exposures.',
  },
  {
    emoji: '📊',
    title: 'Watch Progress',
    description: 'See food variety, category balance, and streaks all in one place. You\'re ready to start!',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card
        padding="lg"
        className={`max-w-sm w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-sage-500'
                  : index < currentStep
                  ? 'bg-sage-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{step.emoji}</div>
          <h2 className="text-xl font-bold text-charcoal mb-2">{step.title}</h2>
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isLastStep && (
            <Button variant="ghost" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
          )}
          <Button onClick={handleNext} className={isLastStep ? 'w-full' : 'flex-1'}>
            {isLastStep ? "Let's Go!" : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_complete');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_complete');
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}
