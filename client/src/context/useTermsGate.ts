import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiClient, TermsDocument } from '../services/apiClient';

/**
 * Decides whether the signed-in user has to accept the current Terms & Conditions.
 *
 * idle     - nobody is signed in yet (nothing to check)
 * loading  - asking the server
 * needed   - show the terms; the product stays closed until they are accepted
 * accepted - the current version has been accepted
 * error    - the server could not be reached (fail closed: the product stays closed)
 */
export type TermsGateStatus = 'idle' | 'loading' | 'needed' | 'accepted' | 'error';

export interface TermsGate {
  status: TermsGateStatus;
  terms: TermsDocument | null;
  error: string | null;
  /** Shown above the form after a rejected submit, e.g. when the terms changed meanwhile. */
  notice: string | null;
  submitting: boolean;
  accept: (signedName: string) => Promise<boolean>;
  retry: () => void;
}

export function useTermsGate(userId: string | null): TermsGate {
  const [status, setStatus] = useState<TermsGateStatus>('idle');
  const [terms, setTerms] = useState<TermsDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      setStatus('idle');
      setTerms(null);
      setError(null);
      setNotice(null);
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const current = await apiClient.getTermsStatus();
        if (cancelled) return;
        if (current.accepted) {
          setStatus('accepted');
          return;
        }
        const document = await apiClient.getTerms();
        if (cancelled) return;
        setTerms(document);
        setStatus('needed');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load the Notice');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const accept = useCallback(
    async (signedName: string): Promise<boolean> => {
      if (!terms) return false;
      setSubmitting(true);
      setNotice(null);
      try {
        await apiClient.acceptTerms(terms.version, signedName.trim());
        setStatus('accepted');
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // The terms changed while the form was open: show the new text and ask again.
          setTerms(await apiClient.getTerms());
          setNotice('The Notice was updated. Please review it and accept again.');
        } else {
          setNotice(err instanceof Error ? err.message : 'Could not record your acceptance. Please try again.');
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [terms]
  );

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  return { status, terms, error, notice, submitting, accept, retry };
}
