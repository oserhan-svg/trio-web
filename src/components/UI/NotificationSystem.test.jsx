import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React, { useEffect, useState } from 'react';
import { useNotification, NotificationProvider } from './NotificationSystem';

describe('useNotification hook', () => {
    it('throws error when used outside NotificationProvider', () => {
        const TestComponent = () => {
            useNotification();
            return null;
        };

        // Suppress React error boundary logs for this expected failure
        const consoleError = console.error;
        console.error = () => {};

        try {
            expect(() => render(<TestComponent />)).toThrow('useNotification must be used within NotificationProvider');
        } finally {
            console.error = consoleError;
        }
    });

    it('returns context and renders correctly when inside NotificationProvider', () => {
        const TestComponent = () => {
            const { showNotification } = useNotification();
            const [message, setMessage] = useState('');

            useEffect(() => {
                setMessage(typeof showNotification === 'function' ? 'Valid' : 'Invalid');
            }, [showNotification]);

            return <div data-testid="status">{message}</div>;
        };

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        expect(screen.getByTestId('status').textContent).toBe('Valid');
    });
});
