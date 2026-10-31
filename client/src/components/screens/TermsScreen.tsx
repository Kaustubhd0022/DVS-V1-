import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { TermsGate } from '../../context/useTermsGate';

/** Renders the terms text: "## " lines become headings, other lines paragraphs, "# " is the title. */
const TermsText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('# '))
      .map((line, index) =>
        line.startsWith('## ') ? (
          <h2 key={index} className="mt-5 mb-1.5 text-sm font-semibold text-[#f3e9df]">
            {line.slice(3)}
          </h2>
        ) : (
          <p key={index} className="mb-2 text-[13px] leading-relaxed text-[#cdbfb4]">
            {line}
          </p>
        )
      )}
  </>
);

/**
 * Shown after sign-up / sign-in until the current Notice (terms) is accepted.
 * Accepting records the signature on the server, which emails the signed form to the team.
 */
export const TermsScreen: React.FC<{ gate: TermsGate }> = ({ gate }) => {
  const auth = useAuth();
  const [signedName, setSignedName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const nameOk = signedName.trim().length >= 2;
  const canSubmit = nameOk && agreed && !gate.submitting;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    await gate.accept(signedName);
  };

  return (
    <div className="min-h-screen w-full bg-[#161210] text-[#f3e9df] font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#1f1814] shadow-2xl">
        <div className="px-6 pt-6 pb-3 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#d1805f]" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">{gate.terms?.title ?? 'Notice'}</h1>
            <p className="text-xs text-[#b8aba3]">
              One more step{auth.email ? ` for ${auth.email}` : ''}: please read this notice and agree to continue.
            </p>
          </div>
        </div>

        {(gate.status === 'loading' || gate.status === 'idle') && (
          <div className="px-6 py-16 flex items-center justify-center gap-2 text-sm text-[#b8aba3]" role="status">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Loading the Notice…
          </div>
        )}

        {gate.status === 'error' && (
          <div className="px-6 py-10 space-y-4">
            <p className="text-sm text-red-300" role="alert">
              {gate.error || 'Could not load the Notice.'}
            </p>
            <p className="text-xs text-[#b8aba3]">
              The backend server could not be reached. You can try again, or continue directly to the studio.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={gate.retry}
                className="rounded-lg bg-[#b05232] px-4 py-2 text-sm font-medium text-white hover:bg-[#c25f3d]"
              >
                Try again
              </button>
              <button
                onClick={gate.acceptLocally}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-[#f3e9df] hover:bg-white/15"
              >
                Continue to Studio
              </button>
              <button
                onClick={auth.signOut}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 text-[#cdbfb4]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {gate.status === 'needed' && gate.terms && (
          <form onSubmit={submit} className="px-6 pb-6">
            <div
              role="region"
              aria-label="Notice text"
              tabIndex={0}
              className="h-[46vh] overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-5 focus:outline-none focus:border-[#b05232]"
            >
              <TermsText text={gate.terms.text} />
              <p className="mt-4 text-[11px] text-[#8f8279]">Version {gate.terms.version}</p>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="text-[#cdbfb4]">Full name (your electronic signature)</span>
                <input
                  type="text"
                  value={signedName}
                  onChange={event => setSignedName(event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Type your full name"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-[#b05232]"
                />
              </label>

              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={event => setAgreed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#b05232]"
                />
                <span>I have read, understood, and agree to be bound by this {gate.terms.title}.</span>
              </label>

              {gate.notice && (
                <p className="text-sm text-red-300" role="alert">
                  {gate.notice}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-[#8f8279] max-w-md">
                  When you accept, a signed copy of this form is recorded and emailed to our team.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={auth.signOut}
                    className="text-sm text-[#b8aba3] hover:text-white underline"
                  >
                    Sign out
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-lg bg-[#b05232] px-5 py-2 text-sm font-medium text-white hover:bg-[#c25f3d] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gate.submitting ? 'Recording…' : 'I Agree and Continue'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
