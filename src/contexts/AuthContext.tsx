
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
  displayName: string | null;
  updateDisplayName: (newName: string) => Promise<{ error: any }>;
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
        // It's common for a profile to not exist initially, so only log if it's not a 'not found' error
        if (error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" or "found multiple rows"
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
    // Set up auth state listener
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

    // Check for existing session
    const checkExistingSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentInitialUser = initialSession?.user ?? null;
      setUser(currentInitialUser);
      
      if (currentInitialUser) {
        const name = await fetchProfileDisplayName(currentInitialUser.id);
        setDisplayName(name);
      } else {
        // If no Supabase session, check for Shapes auth
        const shapesAuthToken = localStorage.getItem('shapes_auth_token');
        const shapesUserId = localStorage.getItem('shapes_user_id');
        if (shapesAuthToken && shapesUserId) {
          const mockUser = {
            id: shapesUserId, // Already has fallback in its creation if needed, but here it must exist
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
        } else if (shapesAuthToken) { // Token exists but no ID, less likely scenario
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
    
    // Supabase signOut will trigger onAuthStateChange, which handles resetting state including displayName
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      window.location.href = '/auth';
    } else {
      // If Supabase signout fails, but we want to ensure local state is cleared if somehow inconsistent
      // (onAuthStateChange should ideally still handle it based on lack of session)
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
    } else if (shapesAuthToken) { // Token but no ID
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
      return { error: { message: 'User not authenticated.' } };
    }
    if (!newName || newName.trim().length < 3) {
      return { error: { message: 'Display name must be at least 3 characters.' } };
    }

    try {
      const { error: updateError } = await supabase // Renamed error to updateError
        .from('profiles')
        .update({ display_name: newName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating display name:', updateError);
        return { error: updateError };
      }

      setDisplayName(newName);
      return { error: null };
    } catch (e: any) {
      console.error('Exception updating display name:', e);
      return { error: { message: e.message || 'An unexpected error occurred.' } };
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
