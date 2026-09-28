import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackScreen?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-[#141724] border border-rose-500/30 shadow-2xl shadow-black space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Stage Render Safeguard
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Temporary Stage Interruption
            </h2>
            <p className="text-xs text-white/60 leading-relaxed max-w-lg mx-auto">
              This stage encountered an unexpected data discrepancy. The application state is fully preserved in Story Brain.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
              <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry This Stage</span>
            </button>

            {this.props.fallbackScreen && (
              <button
                onClick={() => {
                  this.handleReset();
                  this.props.fallbackScreen!();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all"
              >
                <Home className="w-3.5 h-3.5 text-white/70" />
                <span>Return to Discovery Studio</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
