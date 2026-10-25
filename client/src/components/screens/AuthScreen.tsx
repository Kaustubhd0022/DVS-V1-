import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/** Sign-in / sign-up form, and the waiting and error states while the session is established. */
export const AuthScreen: React.FC = () => {
  const { status, error, signIn, signUp, signOut, retry } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    setMessage(null);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) setMessage('Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-xl font-semibold mb-1">Tattava Copilot</h1>

        {status === 'loading' || status === 'provisioning' ? (
          <p className="text-sm text-white/60 mt-4" role="status">
            {status === 'loading' ? 'Restoring your session…' : 'Setting up your workspace…'}
          </p>
        ) : status === 'error' ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-red-300" role="alert">
              {error || 'Could not reach the server.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={retry}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
              >
                Try again
              </button>
              <button
                onClick={signOut}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <p className="text-sm text-white/60">
              {mode === 'sign-in' ? 'Sign in to open your projects.' : 'Create an account.'}
            </p>
            <label className="block text-sm">
              <span className="text-white/70">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-amber-400"
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/70">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-amber-400"
              />
            </label>

            {formError && (
              <p className="text-sm text-red-300" role="alert">
                {formError}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-300" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
                setFormError(null);
                setMessage(null);
              }}
              className="w-full text-center text-sm text-white/60 hover:text-white"
            >
              {mode === 'sign-in' ? 'No account? Sign up' : 'Have an account? Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
