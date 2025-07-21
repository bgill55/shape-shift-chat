import React from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-[rgb(var(--card))] dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-[rgb(var(--fg))] dark:text-white mb-4">Welcome to Shape Shift!</h1>
        <p className="text-[rgb(var(--fg))] dark:text-gray-300 mb-6">
          Let's get you set up. This is a placeholder for your onboarding steps.
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-600 text-[rgb(var(--fg))] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
