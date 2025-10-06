import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (url: string) => void;
}

export function AddModelModal({ isOpen, onClose, onAddModel }: AddModelModalProps) {
  const [url, setUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    if (!url.includes('openrouter.ai/')) {
      toast({
        title: "Error", 
        description: "Please enter a valid OpenRouter URL",
        variant: "destructive"
      });
      return;
    }

    onAddModel(url);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setUrl('');
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setUrl('');
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--fg))] max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold text-card-foreground">Add New Model</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a Model's vanity URL to add it to your collection. Example: https://openrouter.ai/google/gemini-flash-1.5
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="model-url" className="block text-sm font-medium mb-2 text-foreground">
                Model URL
              </label>
              <Input
                id="model-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://openrouter.ai/google/gemini-flash-1.5"
                className="bg-input border-border text-foreground placeholder-muted-foreground"
                disabled={showSuccess}
              />
            </div>

            {showSuccess && (
              <div className="text-green-500 text-center font-medium">
                Model added successfully!
              </div>
            )}

            {!showSuccess && (
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Model
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}