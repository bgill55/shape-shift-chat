
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useShapesAuth } from '@/hooks/useShapesAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    oneTimeCode,
    setOneTimeCode,
    loading: shapesLoading,
    showCodeInput,
    redirectToShapesAuth,
    exchangeCodeForToken,
  } = useShapesAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#36393f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2f3136] border-[#202225]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-[#96989d]">
            {isSignUp 
              ? 'Sign up to start chatting with AI shapes' 
              : 'Sign in to your account to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth Authentication Section */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || shapesLoading || googleLoading}
              className="w-full bg-[#4285f4] hover:bg-[#357ae8] text-white flex items-center gap-3"
            >
              <img 
                src="/assets/31cd7466-c4e0-48f7-b8a4-2ac846a9f3db.png" 
                alt="Google" 
                className="w-5 h-5 rounded-full object-cover"
              />
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            <Button
              onClick={redirectToShapesAuth}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center gap-3"
              disabled={loading || shapesLoading || googleLoading}
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
            <div className="space-y-3">
              <div>
                <Input
                  type="text"
                  placeholder="Enter one-time code from Shapes"
                  value={oneTimeCode}
                  onChange={(e) => setOneTimeCode(e.target.value)}
                  className="bg-[#40444b] border-[#202225] text-white placeholder-[#72767d]"
                />
              </div>
              <Button
                onClick={exchangeCodeForToken}
                disabled={shapesLoading || !oneTimeCode.trim()}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
              >
                {shapesLoading ? 'Exchanging...' : 'Exchange Code for Token'}
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#202225]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#2f3136] px-2 text-[#96989d]">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Authentication Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#40444b] border-[#202225] text-white placeholder-[#72767d]"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#40444b] border-[#202225] text-white placeholder-[#72767d]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || shapesLoading || googleLoading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#00a8fc] hover:underline text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
