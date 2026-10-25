import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Cpu, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { getAiStatus, testAiConnection } from '../../services/aiService';
import { BentoCard, LineaButton, LineaEqualizerWave } from '../common/LineaUI';

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <BentoCard className="w-full max-w-lg bg-[#0e1119]/95 border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl p-0">
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#fbf8f3]">tattvaCo AI Engine</h3>
              <p className="text-xs text-stone-400">HuggingFace Inference, executed from the secure backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-mono font-bold text-[#fbf8f3]">{status?.model ?? '…'}</div>
                <div className="text-[11px] text-stone-400">Configured model (with automatic failover)</div>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                ready 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
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
            <p className="text-xs text-stone-400 leading-relaxed bg-[#0a0c12]/60 p-3 rounded-2xl border border-white/[0.06]">
              Set <span className="font-mono text-amber-300">HUGGINGFACE_API_TOKEN</span> in <span className="font-mono text-stone-300">server/.env</span>{' '}
              and restart the backend. The token never needs to be entered in the browser.
            </p>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
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

          <div className="pt-2 border-t border-white/[0.06] flex items-start gap-2.5 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">Prompts are routed through your private server environment. No secrets or API credentials are exposed in the client browser.</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-black/40 border-t border-white/[0.08] flex items-center justify-between">
          <LineaButton
            variant="ghost"
            size="sm"
            showWave={testing}
            onClick={handleTest}
            disabled={testing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />}
          >
            {testing ? 'Verifying...' : 'Test Connection'}
          </LineaButton>

          <LineaButton
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </LineaButton>
        </div>
      </BentoCard>
    </div>
  );
};
