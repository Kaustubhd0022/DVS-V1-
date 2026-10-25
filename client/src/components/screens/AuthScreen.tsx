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
    <div className="min-h-screen bg-[#0a0c12] text-[#fbf8f3] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0e1119]/90 backdrop-blur-2xl p-8 lg:p-10 shadow-2xl shadow-black/80">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">TattvaCo Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#fbf8f3]">Film Development OS</h1>
        <p className="text-xs text-stone-400 mt-1">Autonomous narrative reasoning & production intelligence</p>

        {status === 'loading' || status === 'provisioning' ? (
          <div className="mt-8 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="linea-btn-wave h-4 mb-3 text-amber-400">
              <span className="h-2" />
              <span className="h-4" />
              <span className="h-3" />
            </div>
            <p className="text-xs text-stone-300 font-medium" role="status">
              {status === 'loading' ? 'Restoring your session…' : 'Setting up your workspace…'}
            </p>
          </div>
        ) : status === 'error' ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error || 'Could not reach the server.'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={retry}
                className="flex-1 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-amber-300 shadow-md shadow-amber-400/20"
              >
                Try again
              </button>
              <button
                onClick={signOut}
                className="flex-1 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-stone-300 hover:bg-white/[0.05] transition"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="flex p-1 rounded-full bg-black/40 border border-white/[0.08] mb-4">
              <button
                type="button"
                onClick={() => { setMode('sign-in'); setFormError(null); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${mode === 'sign-in' ? 'bg-white/10 text-[#fbf8f3] shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('sign-up'); setFormError(null); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${mode === 'sign-up' ? 'bg-white/10 text-[#fbf8f3] shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
              >
                Create account
              </button>
            </div>

            <label className="block text-xs">
              <span className="text-stone-300 font-medium">Work Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="director@studio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-2.5 text-xs text-[#fbf8f3] outline-none placeholder:text-stone-500 focus:border-amber-400/80 transition"
              />
            </label>

            <label className="block text-xs">
              <span className="text-stone-300 font-medium">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-full border border-white/[0.1] bg-[#141824]/90 px-5 py-2.5 text-xs text-[#fbf8f3] outline-none placeholder:text-stone-500 focus:border-amber-400/80 transition"
              />
            </label>

            {formError && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3" role="alert">
                {formError}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-5 py-3 text-xs font-bold text-stone-950 transition hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-400/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <div className="linea-btn-wave h-3 text-stone-950">
                    <span className="h-1.5" />
                    <span className="h-3" />
                    <span className="h-2" />
                  </div>
                  <span>Processing…</span>
                </>
              ) : mode === 'sign-in' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
