import React from 'react';
import { useParams } from 'react-router-dom';
import ListingCard from '../components/UI/ListingCard';
import './PageStyles.css';
import listingsData from '../data/listings.json';

const allListings = listingsData;

const CategoryPage = () => {
    const { categoryId } = useParams();

    // Map URL slug to readable title
    const categoryTitles = {
        'satilik-arsa': 'Satılık Arsa',
        'satilik-daire': 'Satılık Daire',
        'satilik-villa': 'Satılık Villa',
        'satilik-tas-ev': 'Satılık Taş Ev / Rum Evi',
        'satilik-zeytinlik': 'Satılık Zeytinlik'
    };

    const title = categoryTitles[categoryId] || 'Tüm İlanlar';
    const filteredListings = allListings.filter(l => l.category === categoryId);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{title}</h1>
                <p>Aradığınız kriterlere uygun güncel ilanlarımız.</p>
            </div>

            {filteredListings.length > 0 ? (
                <div className="listings-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredListings.map(listing => (
                        <ListingCard key={listing.id} {...listing} />
                    ))}
                </div>
            ) : (
                <div className="no-listings">
                    <p>Bu kategoride şu an ilan bulunmamaktadır.</p>
                    <a href="/" className="back-link">Tüm İlanlara Dön</a>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
