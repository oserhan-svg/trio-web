import React from 'react';
import useListings from '../hooks/useListings';
import PropertyCard from '../components/UI/PropertyCard';
import './UserControl.css';

const UserControl = () => {
    const { listings, favorites, toggleFavorite } = useListings();

    const favoriteListings = listings.filter(l => favorites.includes(l.id));

    return (
        <div className="user-control-page">
            <header className="user-header">
                <h1>Hesabım</h1>
                <p>Favori ilanlarınız ve kişisel tercihleriniz.</p>
            </header>

            <main className="user-content">
                <section className="favorites-section">
                    <div className="section-title">
                        <h2>Favori İlanlarım</h2>
                        <span className="count-badge">{favoriteListings.length} İlan</span>
                    </div>

                    {favoriteListings.length > 0 ? (
                        <div className="favorites-grid">
                            {favoriteListings.map(listing => (
                                <PropertyCard
                                    key={listing.id}
                                    {...listing}
                                    isFavorite={true}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-favorites">
                            <p>Henüz favori ilanınız bulunmuyor.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserControl;
