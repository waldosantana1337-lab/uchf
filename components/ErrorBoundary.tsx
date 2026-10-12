
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  /**
   * Components to be wrapped by the error boundary.
   */
  children?: ReactNode;
  /**
   * Custom fallback UI to display when an error occurs.
   */
  fallback?: ReactNode;
}

interface State {
  /**
   * Whether an error has been caught by the boundary.
   */
  hasError: boolean;
  error?: Error;
}

/**
 * Standard React Error Boundary component to catch JavaScript errors anywhere 
 * in their child component tree, log those errors, and display a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error information to the console for debugging.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('🛠️ Error Boundary Caught Exception');
    console.error('Error:', error);
    console.info('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  public render() {
    // Access state and props which are now correctly inherited from React.Component.
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-12 text-center bg-white rounded-[3rem] shadow-2xl border border-red-100 my-8 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tighter">Kitchen Malfunction</h2>
          <p className="text-gray-500 mb-8 font-medium italic">"{this.state.error?.message || 'A silent error occurred in the pantry.'}"</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-10 py-4 bg-[#1A1A1A] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95"
          >
            Reset Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
