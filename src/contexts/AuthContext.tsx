
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshShapesAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If no Supabase session, check for Shapes auth
      if (!session) {
        const shapesAuthToken = localStorage.getItem('shapes_auth_token');
        if (shapesAuthToken) {
          // Create a mock user object for Shapes authentication
          const mockUser = {
            id: 'shapes-user',
            email: 'shapes-user@shapes.local',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {
              provider: 'shapes',
              shapes_auth_token: shapesAuthToken
            }
          } as User;
          
          setUser(mockUser);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    // Clear Shapes auth tokens
    localStorage.removeItem('shapes_auth_token');
    localStorage.removeItem('shapes_app_id');
    
    const { error } = await supabase.auth.signOut();
    
    // Clear user state regardless of Supabase signOut result
    setUser(null);
    setSession(null);
    
    if (!error) {
      window.location.href = '/auth';
    }
  };

  const refreshShapesAuthStatus = () => {
    setLoading(true);
    const shapesAuthToken = localStorage.getItem('shapes_auth_token');
    if (shapesAuthToken) {
      const mockUser = {
        id: 'shapes-user',
        email: 'shapes-user@shapes.local',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          provider: 'shapes',
          shapes_auth_token: shapesAuthToken
        }
      } as User;
      setUser(mockUser);
    } else {
      setUser(null);
    }
    setSession(null); // Shapes auth is not Supabase session based
    setLoading(false);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshShapesAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
