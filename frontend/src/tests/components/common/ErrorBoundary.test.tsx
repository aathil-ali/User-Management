import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ErrorBoundary } from '@/components/ErrorBoundary';

// Helper component that throws an error conditionally
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  const originalLocationReload = window.location.reload;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock console.error
    console.error = vi.fn();

    // Mock window.location.reload using Object.defineProperty
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
    // Restore original window.location.reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: originalLocationReload },
    } as PropertyDescriptor);
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('catches an error and displays the default fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    // Check that console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('calls the onError prop when an error occurs', () => {
    const handleError = vi.fn();
    render(
      <ErrorBoundary onError={handleError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('resets the error state when "Try Again" is clicked', async () => {
    let shouldThrow = true; // Local flag for this test

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await userEvent.click(tryAgainButton);

    // After clicking try again, the error boundary will re-render its children.
    // We now set shouldThrow to false and rerender to simulate the error being resolved.
    shouldThrow = false;
    await act(async () => {
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
      expect(screen.getByText('No Error')).toBeInTheDocument();
    });
  });

  it('calls window.location.reload when "Reload Page" is clicked', async () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    await userEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
}
