
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApiKey: (key: string) => void;
  currentApiKey: string;
}

export function ApiKeyModal({ isOpen, onClose, onSaveApiKey, currentApiKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('shapes-api-key') || currentApiKey;
      setApiKey(savedKey);
    }
  }, [isOpen, currentApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive"
      });
      return;
    }

    // Basic validation - adjust pattern based on actual Shapes API key format
    const isValidApiKeyFormat = apiKey.length >= 20 && /^[A-Z0-9]+$/i.test(apiKey);
    if (!isValidApiKeyFormat) {
      toast({
        title: "Error",
        description: "Please enter a valid API key format",
        variant: "destructive"
      });
      return;
    }

    onSaveApiKey(apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully!",
    });
    onClose();
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (showKey) return key;
    return '•'.repeat(key.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--fg))] max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold text-card-foreground">Shapes API Configuration</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your Shapes API key to connect with AI bots. You can find your API key in your Shapes account dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-2 text-foreground">
                API Key
              </label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={showKey ? apiKey : maskApiKey(apiKey)}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="NZUZL3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="bg-input border-border text-foreground placeholder-muted-foreground pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <p className="text-muted-foreground text-xs">
              Any valid Shapes API key format is accepted. This app runs in the browser, 
              so your key is saved locally.
            </p>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save API Key
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
