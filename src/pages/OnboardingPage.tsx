import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">
        <OnboardingFlow onComplete={() => navigate('/')} />
      </div>
    </div>
  );
}
