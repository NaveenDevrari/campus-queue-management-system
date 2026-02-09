import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-red-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-500 text-sm mb-6">
                We encountered an unexpected error in this component.
              </p>
              
              <div className="bg-slate-100 rounded-lg p-3 text-left mb-6 overflow-auto max-h-40">
                <p className="font-mono text-xs text-red-600 break-words">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
