
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useShapesAuth() {
  const [oneTimeCode, setOneTimeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshShapesAuthStatus } = useAuth();

  const redirectToShapesAuth = () => {
    // Use the correct app_id for Euclidian - the Shapes API testing app
    const appId = 'f6263f80-2242-428d-acd4-10e1feec44ee'; 
    const shapesAuthUrl = `https://shapes.inc/authorize?app_id=${appId}`;
    
    setShowCodeInput(true);
    window.open(shapesAuthUrl, '_blank', 'width=600,height=700');
    
    toast({
      title: "Shapes Authentication",
      description: "Complete authentication in the new window, then return here to enter your one-time code.",
    });
  };

  const exchangeCodeForToken = async () => {
    if (!oneTimeCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the one-time code from Shapes.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Use the Supabase edge function for token exchange
      const response = await fetch('https://yfmzeszzzrmldcblfxlh.supabase.co/functions/v1/shapes-auth-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbXplc3p6enJtbGRjYmxmeGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDkzMTEsImV4cCI6MjA2NDIyNTMxMX0.sBFdZM0uQqzVll27PF_BIxMZBq9_6Vt7gNbDmk2Ohu8`,
        },
        body: JSON.stringify({ 
          code: oneTimeCode,
          app_id: 'f6263f80-2242-428d-acd4-10e1feec44ee'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange code for token');
      }

      const { auth_token } = await response.json(); // User object no longer expected

      if (!auth_token) {
        throw new Error('Auth token not found in response from auth exchange function');
      }
      
      // Store the auth token and app_id in localStorage
      localStorage.setItem('shapes_auth_token', auth_token);
      localStorage.setItem('shapes_app_id', 'f6263f80-2242-428d-acd4-10e1feec44ee');
      // Implement client-side shapes_user_id logic
      let userId = localStorage.getItem('shapes_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('shapes_user_id', userId);
        console.log('[useShapesAuth] New Shapes User ID generated and stored:', userId);
      } else {
        console.log('[useShapesAuth] Existing Shapes User ID found in localStorage:', userId);
      }
      // The console.error for missing user object from response is removed.

      refreshShapesAuthStatus(); // This will now use the client-managed shapes_user_id
      // Check for user and user.id, then store shapes_user_id
      if (user && user.id) {
        localStorage.setItem('shapes_user_id', user.id);
      } else {
        console.error('User ID not found in Shapes auth response:', user);
        // Potentially show a toast to the user as well, or handle this more gracefully
      }

      refreshShapesAuthStatus();
      toast({
        title: "Success!",
        description: "Successfully authenticated with Shapes. You can now chat with authenticated access.",
      });

      // Reset the form
      setOneTimeCode('');
      setShowCodeInput(false);
      
      // Navigate to the main app - the AuthContext will pick up the localStorage token
      navigate('/');
      
    } catch (error) {
      console.error('Auth exchange error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to exchange code for token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    oneTimeCode,
    setOneTimeCode,
    loading,
    showCodeInput,
    redirectToShapesAuth,
    exchangeCodeForToken,
  };
}
