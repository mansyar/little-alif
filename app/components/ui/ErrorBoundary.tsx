import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerFunctionError } from '~/lib/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  userMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, userMessage: null };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (error instanceof ServerFunctionError) {
      this.setState({ userMessage: error.userMessage });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, userMessage: null });
  };

  render() {
    if (this.state.hasError) {
      const message = this.state.userMessage ?? 'Something went wrong. Please try again.';
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background-warm px-6 py-12 text-center">
          <p className="mb-6 max-w-md text-text-muted">{message}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-large bg-green px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green/90"
          >
            Try Again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
