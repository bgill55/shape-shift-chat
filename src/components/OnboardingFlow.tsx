import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Sparkles, PlusCircle, Key, MessageSquare } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const renderStep = () => {
    let icon = null;
    let title = '';
    let description = '';
    let buttonText = 'Next';
    let buttonIcon = <ArrowRight className="ml-2 h-4 w-4" />;
    let onButtonClick = () => setStep(step + 1);

    switch (step) {
      case 1:
        icon = <Sparkles className="w-16 h-16 text-blue-500 mb-4" />;
        title = 'Welcome to Shape Shift!';
        description = 'Shape Shift is your personal AI assistant, designed to help you interact with various AI models (Shapes) seamlessly.';
        break;
      case 2:
        icon = <PlusCircle className="w-16 h-16 text-green-500 mb-4" />;
        title = 'Add Your First Shape';
        description = 'To get started, you\'ll need to add at least one AI model, or \'Shape\'. You can do this from the sidebar using its vanity URL, for example: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">https://shapes.inc/jarvis-dev</span>.';
        break;
      case 3:
        icon = <Key className="w-16 h-16 text-yellow-500 mb-4" />;
        title = 'Configure Your API Key';
        description = 'Shape Shift uses your own API keys to interact with AI models. You\'ll need to configure this in the settings. You can get your API key from <a href="https://shapes.inc/developer" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">shapes.inc/developer</a>.';
        break;
      case 4:
        icon = <MessageSquare className="w-16 h-16 text-purple-500 mb-4" />;
        title = 'Start Chatting!';
        description = 'You\'re all set! Select a shape from the sidebar to start an individual conversation, or choose multiple shapes for a group chat.';
        buttonText = 'Complete Onboarding';
        buttonIcon = <CheckCircle className="ml-2 h-4 w-4" />;
        onButtonClick = onComplete;
        break;
      default:
        return null;
    }

    return (
      <div className="text-center animate-fade-in" aria-live="polite">
        {React.cloneElement(icon, { 'aria-hidden': 'true' })}
        <h2 className="text-2xl font-bold text-[rgb(var(--fg))] mb-4">{title}</h2>
        <p className="text-[rgb(var(--fg))] mb-6" dangerouslySetInnerHTML={{ __html: description }}></p>
        <Button onClick={onButtonClick}>
          {buttonText} {buttonIcon}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] px-4">
      <div className="p-8 bg-[rgb(var(--card))] rounded-lg shadow-md w-full max-w-md">
        {renderStep()}
        <div className="flex justify-center mt-6 space-x-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full ${step === index + 1 ? 'bg-blue-500' : 'bg-gray-300'}`}
              aria-label={`Step ${index + 1} of ${totalSteps}${step === index + 1 ? ', current step' : ''}`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
