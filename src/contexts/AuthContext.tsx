import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshShapesAuthStatus: () => void;
  displayName: string | null;
  updateDisplayName: (newName: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileDisplayName = async (userId: string) => {
    if (!userId) return null;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile for display name:', error.message);
        }
        return null;
      }
      return profile?.display_name || null;
    } catch (e) {
      console.error('Exception fetching profile for display name:', e);
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const name = await fetchProfileDisplayName(currentUser.id);
          setDisplayName(name);
        } else {
          setDisplayName(null);
        }
        setLoading(false);
      }
    );

    const checkExistingSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentInitialUser = initialSession?.user ?? null;
      setUser(currentInitialUser);
      
      if (currentInitialUser) {
        const name = await fetchProfileDisplayName(currentInitialUser.id);
        setDisplayName(name);
      } else {
        const shapesAuthToken = localStorage.getItem('shapes_auth_token');
        const shapesUserId = localStorage.getItem('shapes_user_id');
        if (shapesAuthToken && shapesUserId) {
          const mockUser = {
            id: shapesUserId,
            email: 'shapes-user@shapes.local',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {
              provider: 'shapes',
              shapes_auth_token: shapesAuthToken,
              actual_shapes_user_id: shapesUserId,
            }
          } as User;
          setUser(mockUser);
          const name = await fetchProfileDisplayName(shapesUserId);
          setDisplayName(name);
        } else if (shapesAuthToken) {
           const mockUser = {
            id: 'shapes-user-fallback-initial',
            email: 'shapes-user@shapes.local',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { provider: 'shapes', shapes_auth_token: shapesAuthToken }
          } as User;
           setUser(mockUser);
           setDisplayName(null);
        } else {
          setDisplayName(null);
        }
      }
      setLoading(false);
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
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
    localStorage.removeItem('shapes_auth_token');
    localStorage.removeItem('shapes_app_id');
    localStorage.removeItem('shapes_user_id');
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      window.location.href = '/auth';
    } else {
      console.error("Error signing out from Supabase:", error);
      setUser(null);
      setSession(null);
      setDisplayName(null);
    }
  };

  const refreshShapesAuthStatus = async () => {
    setLoading(true);
    setSession(null); 
    const shapesAuthToken = localStorage.getItem('shapes_auth_token');
    const shapesUserId = localStorage.getItem('shapes_user_id');

    if (shapesAuthToken && shapesUserId) {
      const mockUser = {
        id: shapesUserId,
        email: 'shapes-user@shapes.local',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          provider: 'shapes',
          shapes_auth_token: shapesAuthToken,
          actual_shapes_user_id: shapesUserId,
        }
      } as User;
      setUser(mockUser);
      const name = await fetchProfileDisplayName(shapesUserId);
      setDisplayName(name);
    } else if (shapesAuthToken) { 
      const mockUser = {
        id: 'shapes-user-fallback-refresh',
        email: 'shapes-user@shapes.local',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { provider: 'shapes', shapes_auth_token: shapesAuthToken }
      } as User;
      setUser(mockUser);
      setDisplayName(null);
    } else {
      setUser(null);
      setDisplayName(null);
    }
    setLoading(false);
  };

  const updateDisplayName = async (newName: string) => {
    if (!user) {
      return { error: { name: 'AuthError', message: 'User not authenticated.' } as AuthError };
    }
    if (!newName || newName.trim().length < 3) {
      return { error: { name: 'AuthError', message: 'Display name must be at least 3 characters.' } as AuthError };
    }

    try {
      const profileDataToUpsert = {
        id: user.id, 
        display_name: newName.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileDataToUpsert)
        .select() 
        .single(); 

      if (upsertError) {
        return { error: upsertError };
      }

      if (data) {
        setDisplayName(data.display_name);
      } else {
        setDisplayName(newName.trim());
      }
      return { error: null };
    } catch (e: unknown) {
      const error = e as AuthError;
      return { error: { name: error.name, message: error.message } };
    }
  };

  const value = {
    user,
    session,
    loading,
    displayName,
    signIn,
    signUp,
    signOut,
    refreshShapesAuthStatus,
    updateDisplayName,
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