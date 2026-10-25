import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Cpu, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { getAiStatus, testAiConnection } from '../../services/aiService';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI runs on the server (HuggingFace Inference Providers). The provider token is a server
 * setting (HUGGINGFACE_API_TOKEN), so there is nothing to enter in the browser.
 */
export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<{ configured: boolean; provider: string; model: string } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTestResult(null);
    setStatus(null);
    setStatusError(null);
    getAiStatus()
      .then(setStatus)
      .catch(err => setStatusError(err instanceof Error ? err.message : 'Could not reach the server'));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestResult(await testAiConnection());
    setTesting(false);
  };

  const ready = status?.configured === true;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14161f] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-black">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">tattvaCo AI Engine</h3>
              <p className="text-xs text-white/50">HuggingFace Inference, called from the server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-mono font-bold text-white">{status?.model ?? '…'}</div>
                <div className="text-[11px] text-white/50">Configured model (the server may fall back to a second model)</div>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                ready ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${ready ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {statusError ? 'Server unreachable' : status ? (ready ? 'Token configured' : 'Token missing') : 'Checking…'}
            </span>
          </div>

          {statusError && (
            <p className="text-xs text-rose-300" role="alert">
              {statusError}
            </p>
          )}
          {status && !ready && (
            <p className="text-xs text-white/60">
              Set <span className="font-mono">HUGGINGFACE_API_TOKEN</span> in <span className="font-mono">server/.env</span>{' '}
              and restart the backend. The token never needs to be entered in the browser.
            </p>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[11px] text-white/50">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Prompts go to your own server, which adds the provider token. Nothing secret is stored in this browser.</span>
          </div>
        </div>

        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{testing ? 'Verifying...' : 'Test Connection'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
