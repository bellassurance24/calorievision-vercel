import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches any runtime error thrown by its children and renders a graceful
 * fallback instead of crashing the entire app tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Only log in development so production consoles stay clean
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
          <p className="text-gray-500 text-sm max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.reset}
            className="mt-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
