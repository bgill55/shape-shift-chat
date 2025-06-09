
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AddShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShape: (url: string) => void;
}

export function AddShapeModal({ isOpen, onClose, onAddShape }: AddShapeModalProps) {
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

    if (!url.includes('shapes.inc/')) {
      toast({
        title: "Error", 
        description: "Please enter a valid Shapes.inc URL",
        variant: "destructive"
      });
      return;
    }

    onAddShape(url);
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
      <DialogContent className="bg-[#36393f] border-[#202225] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Add New Shape</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-[#96989d] text-sm mb-4">
            Enter a Shape's vanity URL to add it to your collection. Example: 
            https://shapes.inc/bella-donna
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="shape-url" className="block text-sm font-medium mb-2">
                Shape URL
              </label>
              <Input
                id="shape-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://shapes.inc/shape-name"
                className="bg-[#40444b] border-[#202225] text-white placeholder-[#96989d]"
                disabled={showSuccess}
              />
            </div>

            {showSuccess && (
              <div className="text-[#43b581] text-center font-medium">
                Shape added successfully!
              </div>
            )}

            {!showSuccess && (
              <Button
                type="submit"
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
              >
                Add Shape
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
