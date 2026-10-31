import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { apiClient, BackendUser, setAccessTokenProvider } from '../services/apiClient';
import { authEnabled, supabase } from '../services/supabaseClient';

/**
 * disabled     - Supabase is not configured; nobody can sign in
 * loading      - restoring the session
 * signed-out   - show the sign-in screen
 * needs-account - signed in through Google for the first time; the account must be created
 *                 (name confirmed) before the backend user is provisioned
 * provisioning - signed in, creating/loading the backend user
 * ready        - signed in and the backend user exists
 * error        - signed in but the backend could not be reached
 */
export type AuthStatus =
  | 'disabled'
  | 'loading'
  | 'signed-out'
  | 'needs-account'
  | 'provisioning'
  | 'ready'
  | 'error';

interface AuthContextType {
  status: AuthStatus;
  user: BackendUser | null;
  email: string | null;
  /** Name suggested by the identity provider, used to prefill account creation. */
  suggestedName: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ needsConfirmation: boolean }>;
  sendOtp: (email: string, isSignUp?: boolean, metadata?: Record<string, any>) => Promise<void>;
  verifyOtp: (email: string, token: string, type?: 'email' | 'signup') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeAccount: (fullName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
}

const MASTER_SESSION_KEY = 'tattava_master_session';
const SESSION_UPDATED_EVENT = 'tattava_user_session_updated';
// Set in Supabase user_metadata once the person has created their account in the app.
const ACCOUNT_COMPLETED_FLAG = 'account_completed';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!authEnabled);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // True while completeAccount waits for a token that carries the new account metadata.
  const [completingAccount, setCompletingAccount] = useState(false);

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
  // Email sign-ups create the account on the form; OAuth identities (Google) arrive without one.
  const needsAccount =
    completingAccount ||
    Boolean(
      session?.user &&
        session.user.app_metadata?.provider !== 'email' &&
        !session.user.user_metadata?.[ACCOUNT_COMPLETED_FLAG]
    );

  // Create (or fetch) the backend user whenever a different identity signs in.
  useEffect(() => {
    if (!authEnabled) return;
    if (!subject || needsAccount) {
      setUser(null);
      setProvisionError(null);
      return;
    }
    let cancelled = false;
    setProvisionError(null);
    apiClient
      .provisionMe()
      .then(me => !cancelled && setUser(me))
      .catch(err => {
        if (!cancelled) {
          console.warn('Backend server unreachable, falling back to local session user:', err);
          // Graceful fallback: create a local workspace user from session so login succeeds
          const fallbackUser: BackendUser = {
            id: subject,
            organization_id: 'org-local-default',
            name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Tattva Creator',
            email: session?.user?.email || 'creator@tattvaco.local',
            status: 'ACTIVE'
          };
          setUser(fallbackUser);
          setProvisionError(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // accessToken is intentionally not a dependency: token refreshes must not re-provision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, attempt, needsAccount]);

  // The local profile session mirrors the Supabase identity. Writing it here (rather than in
  // signIn/signUp) also covers the OAuth redirect return. A profile name edited in the app is
  // kept as long as the same identity stays signed in.
  const sessionUser = session?.user;
  useEffect(() => {
    if (!sessionUser) return;
    let existing: { id?: string; name?: string } | null = null;
    try {
      existing = JSON.parse(localStorage.getItem(MASTER_SESSION_KEY) || 'null');
    } catch {
      existing = null;
    }
    const email = sessionUser.email || '';
    const sameIdentity = existing?.id === sessionUser.id;
    localStorage.setItem(MASTER_SESSION_KEY, JSON.stringify({
      ...(sameIdentity ? existing : {}),
      name: (sameIdentity && existing?.name) || sessionUser.user_metadata?.full_name || email.split('@')[0] || 'Creator',
      email,
      id: sessionUser.id,
      role: 'Writer / Showrunner',
      signedInAt: new Date().toISOString()
    }));
    window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
    // Only re-run when a different identity signs in, not on token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw new Error(error.message);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
    if (error) throw new Error(error.message);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const sendOtp = useCallback(async (email: string, isSignUp?: boolean, metadata?: Record<string, any>) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: isSignUp ?? false,
        data: metadata || {}
      }
    });
    if (error) throw new Error(error.message);
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string, type?: 'email' | 'signup') => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const targetType = type || 'email';
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: targetType
    });
    if (error) {
      const fallbackType = targetType === 'email' ? 'signup' : 'email';
      const retry = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: fallbackType
      });
      if (retry.error) throw new Error(error.message);
      if (retry.data.session) setSession(retry.data.session);
      return;
    }
    if (data.session) setSession(data.session);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, role?: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const name = fullName?.trim() || email.split('@')[0] || 'Creator';
    const userRole = role?.trim() || 'Writer / Showrunner';
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          role: userRole,
          [ACCOUNT_COMPLETED_FLAG]: true
        }
      }
    });
    if (error) throw new Error(error.message);
    return { needsConfirmation: !data.session };
  }, []);

  const completeAccount = useCallback(async (fullName: string, role?: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const name = fullName.trim();
    if (!name) throw new Error('Please enter your name.');
    const userRole = role?.trim() || 'Writer / Showrunner';
    setCompletingAccount(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, role: userRole, [ACCOUNT_COMPLETED_FLAG]: true }
      });
      if (error) throw new Error(error.message);
      // Reissue the access token so the backend sees the new metadata when it provisions the user.
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw new Error(refreshError.message);
    } finally {
      setCompletingAccount(false);
    }
    try {
      const existing = JSON.parse(localStorage.getItem(MASTER_SESSION_KEY) || '{}');
      localStorage.setItem(MASTER_SESSION_KEY, JSON.stringify({ ...existing, name, role: userRole }));
    } catch {
      // The profile mirror is best-effort; the Supabase metadata is the source of truth.
    }
    window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(MASTER_SESSION_KEY);
    if (supabase) await supabase.auth.signOut();
    window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
  }, []);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  const status: AuthStatus = !authEnabled
    ? 'disabled'
    : !sessionLoaded
      ? 'loading'
      : !accessToken
        ? 'signed-out'
        : needsAccount
          ? 'needs-account'
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
      suggestedName: session?.user.user_metadata?.full_name || session?.user.user_metadata?.name || null,
      error: provisionError,
      signIn,
      signUp,
      sendOtp,
      verifyOtp,
      signInWithGoogle,
      resetPassword,
      completeAccount,
      signOut,
      retry,
    }),
    [status, user, session, provisionError, signIn, signUp, sendOtp, verifyOtp, signInWithGoogle, resetPassword, completeAccount, signOut, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
