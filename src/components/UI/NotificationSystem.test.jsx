import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotification } from './NotificationSystem';

// Test component that consumes the notification context
const TestComponent = () => {
    const { showNotification } = useNotification();

    return (
        <div>
            <button onClick={() => showNotification('Success message!', 'success')}>
                Show Success
            </button>
            <button onClick={() => showNotification('Error message!', 'error')}>
                Show Error
            </button>
        </div>
    );
};

describe('NotificationSystem', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
        cleanup();
    });

    it('renders children correctly without throwing', () => {
        render(
            <NotificationProvider>
                <div data-testid="child-element">Child Content</div>
            </NotificationProvider>
        );
        expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('throws error if useNotification is used outside of NotificationProvider', () => {
        // Suppress console.error for expected thrown error boundary to avoid noisy test output
        const originalError = console.error;
        console.error = vi.fn();

        expect(() => render(<TestComponent />)).toThrow('useNotification must be used within NotificationProvider');

        console.error = originalError;
    });

    it('shows a notification when showNotification is called', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const successButton = screen.getByText('Show Success');
        await user.click(successButton);

        expect(screen.getByText('Success message!')).toBeInTheDocument();
    });

    it('auto-dismisses the notification after 3 seconds', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const successButton = screen.getByText('Show Success');
        await user.click(successButton);

        expect(screen.getByText('Success message!')).toBeInTheDocument();

        // Advance timers by 2999ms, notification should still be there
        act(() => {
            vi.advanceTimersByTime(2999);
        });
        expect(screen.getByText('Success message!')).toBeInTheDocument();

        // Advance timers by 1ms more to reach 3000ms
        act(() => {
            vi.advanceTimersByTime(1);
        });

        // Wait for AnimatePresence exit animation (framer-motion) to finish which removes node from DOM
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.queryByText('Success message!')).not.toBeInTheDocument();
    });

    it('handles multiple notifications correctly', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const successButton = screen.getByText('Show Success');
        const errorButton = screen.getByText('Show Error');

        await user.click(successButton);
        await user.click(errorButton);

        expect(screen.getByText('Success message!')).toBeInTheDocument();
        expect(screen.getByText('Error message!')).toBeInTheDocument();

        // Advance timers by 3000ms for timeouts
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        // Advance timers for exit animations to finish
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.queryByText('Success message!')).not.toBeInTheDocument();
        expect(screen.queryByText('Error message!')).not.toBeInTheDocument();
    });
});
