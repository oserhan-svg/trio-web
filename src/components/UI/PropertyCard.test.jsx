import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard.jsx';
import { NotificationProvider } from './NotificationSystem.jsx';

describe('PropertyCard', () => {
    it('uses fallback image when img onError is triggered', () => {
        const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';
        const brokenImageUrl = 'http://example.com/broken.jpg';

        render(
            <BrowserRouter>
                <NotificationProvider>
                    <PropertyCard
                        id="1"
                        title="Test Property"
                        price="1000000"
                        location="Test Location"
                        imageUrl={brokenImageUrl}
                    />
                </NotificationProvider>
            </BrowserRouter>
        );

        const img = screen.getByRole('img', { name: 'Test Property' });
        expect(img.src).toBe(brokenImageUrl);

        fireEvent.error(img);

        expect(img.src).toBe(fallbackImage);
    });
});
