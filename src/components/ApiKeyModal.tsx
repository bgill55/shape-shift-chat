
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
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

    if (apiKey.length < 20) {
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
      <DialogContent className="bg-[#36393f] border-[#202225] text-white max-w-md">
        <DialogHeader>
          <h2 className="text-xl font-semibold">Shapes API Configuration</h2>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-[#96989d] text-sm mb-4">
            Enter your Shapes API key to connect with AI bots. You can find your API key in your 
            Shapes account dashboard. We support both UUID format keys and standard API keys.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-2">
                API Key
              </label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={showKey ? apiKey : maskApiKey(apiKey)}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="NZUZL3TKUX6TIB8IJMHXWVISXCJOC7JYMHNSUBGRTFO"
                  className="bg-[#40444b] border-[#202225] text-white placeholder-[#96989d] pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#96989d] hover:text-white text-sm"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <p className="text-[#96989d] text-xs">
              Any valid Shapes API key format is accepted. This app runs in the browser, 
              so your key is saved locally.
            </p>

            <Button
              type="submit"
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
            >
              Save API Key
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
