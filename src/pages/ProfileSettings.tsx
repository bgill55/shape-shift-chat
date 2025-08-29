import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const { user, displayName, description, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (displayName) {
      setNewDisplayName(displayName);
    }
    if (description) {
      setNewDescription(description);
    }
  }, [displayName, description]);

  const handleSaveChanges = async () => {
    if (!user) {
      setError("You must be logged in to update your profile.");
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);

    const trimmedDisplayName = newDisplayName.trim();
    const trimmedDescription = newDescription.trim();

    const profileChanged = trimmedDisplayName !== (displayName || '') || trimmedDescription !== (description || '');

    if (profileChanged) {
      if (trimmedDisplayName.length < 3) {
        setError("Display name must be at least 3 characters long.");
        setIsLoading(false);
        return;
      }
      const { error: profileError } = await updateProfile({
        displayName: trimmedDisplayName,
        description: trimmedDescription,
      });

      if (profileError) {
        const errorMessage = profileError.message || "Failed to update profile.";
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
    const trimmedDescription = newDescription.trim();
    const profileChanged = trimmedDisplayName !== (displayName || '') || trimmedDescription !== (description || '');

    if (!profileChanged) return true;
    if (trimmedDisplayName.length < 3) return true;

    return false;
  })();

  return (
    <div className="flex justify-center items-start pt-10 min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg bg-card text-card-foreground border-border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-card-foreground">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your display name and description.
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
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Brief Description</Label>
            <Textarea
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="A brief description for the Shape to use."
              className="w-full bg-input text-foreground placeholder-muted-foreground border-border focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isLoading}
              rows={4}
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