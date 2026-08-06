import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Page ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-[#0d0d0d] text-white">
          <div className="max-w-md w-full bg-[#141414] border border-red-900/60 rounded-[16px] p-8 space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-xl text-white">
                {this.props.fallbackTitle || 'PAGE RENDER FAILURE'}
              </h2>
              <p className="font-mono text-xs text-red-300/80 bg-[#0d0d0d] p-3 rounded-[8px] border border-red-900/30 text-left overflow-x-auto">
                {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-[12px] bg-accent text-[#0d0d0d] font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> RETURN TO MAIN MENU
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
