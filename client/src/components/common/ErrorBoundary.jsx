import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected display issue occurred. Clicking reload will restore your view.
              </p>
            </div>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-rose-600 bg-rose-50 p-2.5 rounded-lg text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="primary" size="sm" onClick={this.handleReload} className="text-xs font-bold">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reload Page</span>
              </Button>
              <a href="/">
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <span>Go to Home</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
