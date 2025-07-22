import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[rgb(var(--fg))] mb-4">Welcome to Shape Shift!</h1>
            <p className="text-[rgb(var(--fg))] mb-6">
              Shape Shift is your personal AI assistant, designed to help you interact with various AI models (Shapes) seamlessly.
            </p>
            <Button onClick={() => setStep(2)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[rgb(var(--fg))] mb-4">Add Your First Shape</h2>
            <p className="text-[rgb(var(--fg))] mb-6">
              To get started, you'll need to add at least one AI model, or 'Shape'. You can do this from the sidebar using its vanity URL, for example: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">https://shapes.inc/jarvis-dev</span>.
            </p>
            <Button onClick={() => setStep(3)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[rgb(var(--fg))] mb-4">Configure Your API Key</h2>
            <p className="text-[rgb(var(--fg))] mb-6">
              Shape Shift uses your own API keys to interact with AI models. You'll need to configure this in the settings. You can get your API key from <a href="https://shapes.inc/developer" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">shapes.inc/developer</a>.
            </p>
            <Button onClick={() => setStep(4)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[rgb(var(--fg))] mb-4">Start Chatting!</h2>
            <p className="text-[rgb(var(--fg))] mb-6">
              You're all set! Select a shape from the sidebar to start an individual conversation, or choose multiple shapes for a group chat.
            </p>
            <Button onClick={onComplete}>
              Complete Onboarding <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] px-4">
      <div className="p-8 bg-[rgb(var(--card))] rounded-lg shadow-md w-full max-w-md">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;