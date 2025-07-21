import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false; // Default to false on server-side rendering
    }
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const markOnboardingAsSeen = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    }
  };

  // Optional: Reset onboarding for testing purposes
  const resetOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_KEY);
      setHasSeenOnboarding(false);
    }
  };

  return { hasSeenOnboarding, markOnboardingAsSeen, resetOnboarding };
}
