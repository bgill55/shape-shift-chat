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
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function ProfileSettings() {
  const { user, displayName, updateDisplayName } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (displayName) {
      setNewDisplayName(displayName);
    }
  }, [displayName]);

  const handleSaveChanges = async () => {
    if (!user) {
      setError("You must be logged in to update your profile.");
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);

    const trimmedDisplayName = newDisplayName.trim();
    const displayNameChanged = trimmedDisplayName !== (displayName || '');

    if (displayNameChanged) {
      if (trimmedDisplayName.length < 3) {
        setError("Display name must be at least 3 characters long.");
        setIsLoading(false);
        return;
      }
      const { error: displayNameError } = await updateDisplayName(trimmedDisplayName);
      if (displayNameError) {
        const errorMessage = displayNameError.message || "Failed to update display name.";
        setError(errorMessage);
        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
    }

    toast({
      title: 'Success!',
      description: 'Profile updated successfully.',
    });
    navigate('/');
    setIsLoading(false);
  };

  const isButtonDisabled = (() => {
    if (isLoading) return true;

    const trimmedDisplayName = newDisplayName.trim();
    const displayNameChanged = trimmedDisplayName !== (displayName || '');

    if (!displayNameChanged) return true; // No changes
    if (displayNameChanged && trimmedDisplayName.length < 3) return true; // Invalid display name

    return false;
  })();

  return (
    <div className="flex justify-center items-start pt-10 min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg bg-card text-card-foreground border-border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-card-foreground">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your display name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
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
        <CardFooter className="pt-4">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
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

export default ProfileSettings;