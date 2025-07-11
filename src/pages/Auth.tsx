
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useShapesAuth } from '@/hooks/useShapesAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client'; // No longer needed for OAuth

export default function Auth() {
  // const [isSignUp, setIsSignUp] = useState(false); // Removed
  // const [email, setEmail] = useState(''); // Removed
  // const [password, setPassword] = useState(''); // Removed
  // const [loading, setLoading] = useState(false); // Removed (local form loading)
  // const [googleLoading, setGoogleLoading] = useState(false); // Removed
  // const { signIn, signUp } = useAuth(); // Removed
  // const { toast } = useToast(); // Potentially keep if Shapes auth uses it directly, otherwise remove
  // const navigate = useNavigate(); // Potentially keep if Shapes auth uses it directly

  const {
    oneTimeCode,
    setOneTimeCode,
    loading: shapesLoading, // This loading state is from useShapesAuth
    showCodeInput,
    redirectToShapesAuth,
    exchangeCodeForToken,
  } = useShapesAuth();

  // handleSubmit and handleGoogleSignIn functions are removed

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--color-secondary)] text-[var(--color-text)] border-[var(--color-border)] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--color-text)]">
            Sign In
          </CardTitle>
          <CardDescription className="text-[var(--color-placeholder-text)]">
            Sign in to your account using Shapes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6"> {/* Ensure consistent padding */}
          {/* Shapes Authentication Section */}
          <div className="space-y-3">
            {/* Google Sign-In Button Removed */}
            
            <Button
              onClick={redirectToShapesAuth}
              // Assuming this is a primary action button, use primary variant or classes
              // If this purple is a specific brand color, it might need a custom variant
              // For now, let's use standard primary button styling from shadcn/ui
              className="w-full bg-[var(--color-button-bg-primary)] text-[var(--color-button-text-primary)] hover:bg-[var(--color-button-bg-primary)] flex items-center gap-3"
              disabled={shapesLoading}
            >
              <img 
                src="/assets/64386f12-2503-4cf8-b538-54e33bb22e8d.png" 
                alt="Shapes" 
                className="w-5 h-5"
              />
              Sign in with Shapes
            </Button>
          </div>
          
          {showCodeInput && (
            <div className="space-y-3 pt-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter one-time code from Shapes"
                  value={oneTimeCode}
                  onChange={(e) => setOneTimeCode(e.target.value)}
                  className="bg-[var(--color-input-bg)] text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] border-[var(--color-border)] focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={exchangeCodeForToken}
                disabled={shapesLoading || !oneTimeCode.trim()}
                // Assuming this is also a primary action button
                className="w-full bg-[var(--color-button-bg-primary)] text-[var(--color-button-text-primary)] hover:bg-[var(--color-button-bg-primary)]"
              >
                {shapesLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            </div>
          )}

          {/* "Or continue with email" Separator Removed */}
          {/* Email/Password Authentication Section Removed */}
          {/* Sign-Up/Sign-In Toggle Link Removed */}
        </CardContent>
      </Card>
    </div>
  );
}
