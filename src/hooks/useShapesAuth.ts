import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Ensure this path is correct

export function useShapesAuth() {
  const [oneTimeCode, setOneTimeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshShapesAuthStatus } = useAuth();

  const redirectToShapesAuth = () => {
    const appId = 'f6263f80-2242-428d-acd4-10e1feec44ee'; // Euclidian - Shapes API testing app
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
      const response = await fetch('https://yfmzeszzzrmldcblfxlh.supabase.co/functions/v1/shapes-auth-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // This is your Supabase anon key, it's fine to be here.
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbXplc3p6enJtbGRjYmxmeGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDkzMTEsImV4cCI6MjA2NDIyNTMxMX0.sBFdZM0uQqzVll27PF_BIxMZBq9_6Vt7gNbDmk2Ohu8`,
        },
        body: JSON.stringify({ 
          code: oneTimeCode,
          app_id: 'f6263f80-2242-428d-acd4-10e1feec44ee'
        }),
      });

      if (!response.ok) {
        // Try to get error details from response, but handle if it's not JSON
        let errorDetails = 'Failed to exchange code for token';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
        } catch (e) {
          // Response was not JSON or another error occurred
          errorDetails = await response.text() || errorDetails;
        }
        throw new Error(errorDetails);
      }

      const responseData = await response.json();
      const { auth_token } = responseData; // Expecting only auth_token now

      if (!auth_token) {
        throw new Error('Auth token not found in response from auth exchange function');
      }
      
      localStorage.setItem('shapes_auth_token', auth_token);
      localStorage.setItem('shapes_app_id', 'f6263f80-2242-428d-acd4-10e1feec44ee');
      
      let userId = localStorage.getItem('shapes_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('shapes_user_id', userId);
        console.log('[useShapesAuth] New Shapes User ID generated and stored:', userId);
      } else {
        console.log('[useShapesAuth] Existing Shapes User ID found in localStorage:', userId);
      }
      
      refreshShapesAuthStatus();
      
      toast({
        title: "Success!",
        description: "Successfully authenticated with Shapes. You can now chat with authenticated access.",
      });

      setOneTimeCode('');
      setShowCodeInput(false);
      navigate('/');
      
    } catch (error: any) {
      console.error('Auth exchange error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred during authentication.",
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
