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
    <div className="flex justify-center items-start pt-10 min-h-screen bg-[#36393f] text-white">
      <Card className="w-full max-w-md shadow-lg bg-[#2f3136] border-[#202225]">
        <CardHeader className="text-center"> {/* Added text-center to match Auth.tsx aesthetic */}
          <CardTitle className="text-2xl text-white">Profile Settings</CardTitle>
          <CardDescription className="text-[#96989d]">
            Manage your display name. This name will be visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6"> {/* Added pt-6 for spacing like Auth.tsx */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-[#b9bbbe]">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-[#40444b] border-[#202225] text-white placeholder-[#72767d] focus:ring-[#5865f2] focus:border-[#5865f2]"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>} {/* Ensured error text color */}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
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
