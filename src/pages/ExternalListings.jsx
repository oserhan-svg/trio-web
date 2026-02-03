import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListingCard from '../components/UI/ListingCard';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import FilterSidebar from '../components/Filters/FilterSidebar';
import './PageStyles.css';
import config from '../config';

const ExternalListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hooks for URL manipulation
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExternalListings = async () => {
            setLoading(true);
            try {
                // Construct API URL with query params
                const params = new URLSearchParams(location.search);
                const response = await fetch(`${config.API_BASE_URL}/external-listings?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Veri çekilemedi');
                }

                const data = await response.json();
                setListings(data);
                setError(null);
            } catch (err) {
                console.error("External listings fetch error:", err);
                setError('İlanlar yüklenirken bir sorun oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchExternalListings();
    }, [location.search]);

    // Handle filter changes from Sidebar
    const handleFilterChange = (filters) => {
        const params = new URLSearchParams();

        if (filters.category) {
            // Mapping frontend category IDs to backend values if needed
            // Currently backend only has 'residential', but we pass the value
            // in case specific sub_categories populate later.
            // Or we could map 'satilik-villa' -> 'residential' but that loses specificity.
            // For now, let's pass it raw, assuming backend might ignore or use it.
            params.set('category', filters.category);
        }

        if (filters.priceMin > 0) params.set('minPrice', filters.priceMin);
        if (filters.priceMax < 50000000) params.set('maxPrice', filters.priceMax);

        if (filters.bedrooms) params.set('rooms', filters.bedrooms);

        // Amenities are not yet supported by endpoint, but we can add them to query
        // params.set('amenities', filters.amenities.join(','));

        navigate(`/firsatlar?${params.toString()}`);
    };

    return (
        <div className="page-container" style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Sidebar Section */}
            <div style={{ flex: '0 0 300px', display: 'none', flexDirection: 'column', gap: '2rem' }} className="desktop-sidebar">
                <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Main Content */}
            <div style={{ flex: '1' }}>
                <div className="page-header">
                    <h1>Fırsat İlanlar</h1>
                    <p>Özel portföyümüzden seçilmiş fırsatlar.</p>
                </div>

                {/* Mobile Filter Toggle (Simplified) */}
                <div className="mobile-filter-toggle" style={{ marginBottom: '1rem', display: 'none' }}>
                    <details>
                        <summary className="btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>Filtrele</summary>
                        <div style={{ marginTop: '1rem' }}>
                            <FilterSidebar onFilterChange={handleFilterChange} />
                        </div>
                    </details>
                </div>

                {loading ? (
                    <div className="listings-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        <SkeletonLoader type="card" count={6} />
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <h2>Hata</h2>
                        <p>{error}</p>
                    </div>
                ) : listings.length > 0 ? (
                    <div className="listings-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {listings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                title={listing.title}
                                price={listing.price}
                                location={listing.location}
                                room={(listing.specs || '').split('|')[0]?.trim()}
                                area={(listing.specs || '').split('|')[1]?.trim()}
                                imageUrl={listing.image} // Map 'image' to 'imageUrl'
                                type={listing.type}
                                score={listing.score}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-listings">
                        <p>Bu kriterlere uygun fırsat ilanı bulunamadı.</p>
                        <button onClick={() => navigate('/firsatlar')} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Filtreleri Temizle</button>
                    </div>
                )}
            </div>

            {/* CSS to handle responsiveness for sidebar */}
            <style>{`
                @media (min-width: 1024px) {
                    .desktop-sidebar { display: flex !important; }
                }
                @media (max-width: 1023px) {
                    .page-container { flex-direction: column !important; }
                    .mobile-filter-toggle { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default ExternalListings;
