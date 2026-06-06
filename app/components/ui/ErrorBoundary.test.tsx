// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';
import { ServerFunctionError, ErrorCode } from '~/lib/errors';
import type { ReactNode } from 'react';

// Component that always throws on render
function ThrowingChild(): ReactNode {
  throw new Error('💥');
}

// Component that conditionally throws based on a module-level flag.
// The flag is changed before retry to simulate a transient error.
let shouldThrow = true;
function ControlledBomb(): ReactNode {
  if (shouldThrow) {
    throw new Error('💥');
  }
  return <div>All good</div>;
}

function ThrowingServerFunctionError(): ReactNode {
  throw new ServerFunctionError(ErrorCode.AUTH, 'Please sign in again.');
}

function ThrowingServerFunctionErrorNotFound(): ReactNode {
  throw new ServerFunctionError(ErrorCode.NOT_FOUND, 'Item not found.');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    shouldThrow = true;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <ControlledBomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeTruthy();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.queryByText('All good')).toBeNull();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('calls console.error with the error info', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });

  it('resets and re-renders children when the error is transient', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ControlledBomb />
      </ErrorBoundary>,
    );

    // First render throws → fallback shown
    expect(screen.getByText('Try Again')).toBeTruthy();

    // Simulate fixing the transient error before retry
    shouldThrow = false;

    // Click retry: state resets, children re-render successfully
    await user.click(screen.getByText('Try Again'));
    expect(screen.getByText('All good')).toBeTruthy();
  });

  it('still catches errors after retry when the error persists', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    // Error caught
    expect(screen.getByText('Try Again')).toBeTruthy();

    // Click retry — ThrowingChild always throws, error caught again
    await user.click(screen.getByText('Try Again'));
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('shows contextual userMessage for ServerFunctionError(AUTH)', () => {
    render(
      <ErrorBoundary>
        <ThrowingServerFunctionError />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Please sign in again.')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('shows contextual userMessage for ServerFunctionError(NOT_FOUND)', () => {
    render(
      <ErrorBoundary>
        <ThrowingServerFunctionErrorNotFound />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Item not found.')).toBeTruthy();
  });

  it('shows generic message when error is not ServerFunctionError', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
  });

  it('resets userMessage on retry', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingServerFunctionError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Please sign in again.')).toBeTruthy();

    // Rerender with a non-throwing child (simulating transient error)
    rerender(
      <ErrorBoundary>
        <div>Recovered</div>
      </ErrorBoundary>,
    );

    await user.click(screen.getByText('Try Again'));
    expect(screen.getByText('Recovered')).toBeTruthy();
  });
});
