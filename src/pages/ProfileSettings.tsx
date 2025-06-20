import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom'; // Added

export function ProfileSettings() {
  const { user, displayName, updateDisplayName } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Added
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (displayName) {
      setNewDisplayName(displayName);
    } else {
      setNewDisplayName(''); // Initialize as empty if no displayName yet
    }
  }, [displayName]);

  const handleSaveChanges = async () => {
    if (!user) {
      setError("You must be logged in to update your profile.");
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    const trimmedNewDisplayName = newDisplayName.trim();

    // Button should be disabled if this is the case, but as a safeguard:
    if (trimmedNewDisplayName === (displayName || '')) {
      return;
    }
    if (trimmedNewDisplayName.length < 3) {
      setError("Display name must be at least 3 characters long.");
      // Toast is optional here as the button's disabled state and local error message provide feedback
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: updateError } = await updateDisplayName(trimmedNewDisplayName);

    if (updateError) {
      const errorMessage = updateError.message || "Failed to update display name.";
      setError(errorMessage);
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Display name updated successfully.',
      });
      navigate('/'); // Added redirect
    }
    setIsLoading(false);
  };

  // Disable button if display name is unchanged, or shorter than 3 chars (after trim), or loading
  const isButtonDisabled =
    isLoading ||
    newDisplayName.trim().length < 3 ||
    newDisplayName.trim() === (displayName || '');

  return (
    <div className="flex justify-center items-start pt-10 min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg bg-card text-card-foreground border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-card-foreground">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your display name. This name will be visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-input text-foreground placeholder-muted-foreground border-border focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSaveChanges}
            disabled={isButtonDisabled}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
