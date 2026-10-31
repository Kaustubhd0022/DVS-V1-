import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/apiClient', () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return {
    ApiError,
    apiClient: {
      getTermsStatus: vi.fn(),
      getTerms: vi.fn(),
      acceptTerms: vi.fn(),
    },
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ email: 'asha@example.com', signOut: vi.fn() }),
}));

import { ApiError, apiClient } from '../../services/apiClient';
import { useTermsGate } from '../../context/useTermsGate';
import { TermsScreen } from './TermsScreen';

const api = apiClient as unknown as Record<string, ReturnType<typeof vi.fn>>;

const TERMS = {
  version: '2026-10-v1',
  title: 'Notice',
  sha256: 'a'.repeat(64),
  text: '# Notice\n\nI acknowledge that Vyom AI is a confidential product of the Company.\n\nBy selecting I Agree and Continue, I undertake not to disclose it.',
};

afterEach(cleanup);

beforeEach(() => {
  localStorage.clear();
  Object.values(api).forEach(fn => fn.mockReset());
});

describe('useTermsGate', () => {
  it('does nothing until a user is signed in', () => {
    const { result } = renderHook(() => useTermsGate(null));
    expect(result.current.status).toBe('idle');
    expect(api.getTermsStatus).not.toHaveBeenCalled();
  });

  it('lets a user through who already accepted, without loading the text', async () => {
    api.getTermsStatus.mockResolvedValue({ accepted: true, current_version: 'v1', acceptance: null });
    const { result } = renderHook(() => useTermsGate('user-1'));
    await waitFor(() => expect(result.current.status).toBe('accepted'));
    expect(api.getTerms).not.toHaveBeenCalled();
  });

  it('asks for acceptance, then opens after a successful accept', async () => {
    api.getTermsStatus.mockResolvedValue({ accepted: false, current_version: TERMS.version, acceptance: null });
    api.getTerms.mockResolvedValue(TERMS);
    api.acceptTerms.mockResolvedValue({ terms_version: TERMS.version, signed_name: 'Asha Verma', email_status: 'pending' });

    const { result } = renderHook(() => useTermsGate('user-1'));
    await waitFor(() => expect(result.current.status).toBe('needed'));

    let ok = false;
    await act(async () => {
      ok = await result.current.accept('  Asha Verma ');
    });

    expect(ok).toBe(true);
    expect(api.acceptTerms).toHaveBeenCalledWith(TERMS.version, 'Asha Verma');
    expect(result.current.status).toBe('accepted');
  });

  it('stays closed and offers a retry when the server cannot be reached', async () => {
    api.getTermsStatus.mockRejectedValue(new ApiError(0, 'Could not reach the server'));
    const { result } = renderHook(() => useTermsGate('user-1'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Could not reach the server');

    api.getTermsStatus.mockResolvedValue({ accepted: true, current_version: 'v1', acceptance: null });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('accepted'));
  });

  it('reloads the text when the terms changed while the form was open', async () => {
    api.getTermsStatus.mockResolvedValue({ accepted: false, current_version: 'v1', acceptance: null });
    api.getTerms.mockResolvedValueOnce({ ...TERMS, version: 'old' });
    api.acceptTerms.mockRejectedValue(new ApiError(409, 'The Notice was updated.'));

    const { result } = renderHook(() => useTermsGate('user-1'));
    await waitFor(() => expect(result.current.status).toBe('needed'));

    api.getTerms.mockResolvedValue(TERMS);
    let ok = true;
    await act(async () => {
      ok = await result.current.accept('Asha Verma');
    });

    expect(ok).toBe(false);
    expect(result.current.status).toBe('needed');
    expect(result.current.terms?.version).toBe(TERMS.version);
    expect(result.current.notice).toMatch(/updated/i);
  });
});

describe('TermsScreen', () => {
  const setup = async () => {
    api.getTermsStatus.mockResolvedValue({ accepted: false, current_version: TERMS.version, acceptance: null });
    api.getTerms.mockResolvedValue(TERMS);
    api.acceptTerms.mockResolvedValue({ terms_version: TERMS.version, signed_name: 'Asha Verma', email_status: 'pending' });

    const hook = renderHook(() => useTermsGate('user-1'));
    await waitFor(() => expect(hook.result.current.status).toBe('needed'));
    const view = render(<TermsScreen gate={hook.result.current} />);
    return { hook, view };
  };

  it('shows the terms text and keeps Accept disabled until name and agreement are given', async () => {
    await setup();

    expect(screen.getByRole('region', { name: /notice text/i })).toBeTruthy();
    expect(screen.getByText(/is a confidential product of the Company/)).toBeTruthy();
    expect(screen.getByText(/mentioned|emailed to our team/i)).toBeTruthy();

    const button = screen.getByRole('button', { name: /i agree and continue/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText(/type your full name/i), { target: { value: 'Asha Verma' } });
    expect(button.disabled).toBe(true); // still needs the checkbox

    fireEvent.click(screen.getByRole('checkbox'));
    expect(button.disabled).toBe(false);

    fireEvent.change(screen.getByPlaceholderText(/type your full name/i), { target: { value: 'A' } });
    expect(button.disabled).toBe(true); // a one-letter name is not a signature
  });

  it('submits the typed name when accepted', async () => {
    await setup();

    fireEvent.change(screen.getByPlaceholderText(/type your full name/i), { target: { value: 'Asha Verma' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /i agree and continue/i }));

    await waitFor(() => expect(api.acceptTerms).toHaveBeenCalledWith(TERMS.version, 'Asha Verma'));
  });

  it('shows a loading state and an error state with retry', () => {
    const base = { terms: null, error: null, notice: null, submitting: false, accept: vi.fn(), acceptLocally: vi.fn(), retry: vi.fn() };

    const loading = render(<TermsScreen gate={{ ...base, status: 'loading' }} />);
    expect(screen.getByRole('status').textContent).toMatch(/loading/i);
    loading.unmount();

    render(<TermsScreen gate={{ ...base, status: 'error', error: 'Could not reach the server' }} />);
    expect(screen.getByRole('alert').textContent).toBe('Could not reach the server');
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(base.retry).toHaveBeenCalled();
  });
});
