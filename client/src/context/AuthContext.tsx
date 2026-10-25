import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { apiClient, BackendUser, setAccessTokenProvider } from '../services/apiClient';
import { authEnabled, supabase } from '../services/supabaseClient';

/**
 * disabled     - Supabase is not configured; local-only mode
 * loading      - restoring the session
 * signed-out   - show the sign-in screen
 * provisioning - signed in, creating/loading the backend user
 * ready        - signed in and the backend user exists
 * error        - signed in but the backend could not be reached
 */
export type AuthStatus = 'disabled' | 'loading' | 'signed-out' | 'provisioning' | 'ready' | 'error';

interface AuthContextType {
  status: AuthStatus;
  user: BackendUser | null;
  email: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!authEnabled);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    setAccessTokenProvider(async () => (await client.auth.getSession()).data.session?.access_token ?? null);

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const accessToken = session?.access_token;
  const subject = session?.user.id;

  // Create (or fetch) the backend user whenever a different identity signs in.
  useEffect(() => {
    if (!authEnabled) return;
    if (!subject) {
      setUser(null);
      setProvisionError(null);
      return;
    }
    let cancelled = false;
    setProvisionError(null);
    apiClient
      .provisionMe()
      .then(me => !cancelled && setUser(me))
      .catch(err => !cancelled && setProvisionError(err?.message || 'Could not reach the server'));
    return () => {
      cancelled = true;
    };
    // accessToken is intentionally not a dependency: token refreshes must not re-provision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, attempt]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  const status: AuthStatus = !authEnabled
    ? 'disabled'
    : !sessionLoaded
      ? 'loading'
      : !accessToken
        ? 'signed-out'
        : user
          ? 'ready'
          : provisionError
            ? 'error'
            : 'provisioning';

  const value = useMemo<AuthContextType>(
    () => ({
      status,
      user,
      email: session?.user.email ?? null,
      error: provisionError,
      signIn,
      signUp,
      signOut,
      retry,
    }),
    [status, user, session, provisionError, signIn, signUp, signOut, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
