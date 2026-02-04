import React from 'react';
import './ListingCard.css';

const ListingCard = ({ title, price, location, room, area, imageUrl, type, score }) => {
    // Use a fallback image if scraping failed or is placeholder
    const displayImage = (!imageUrl || imageUrl.includes('placeholder'))
        ? 'https://via.placeholder.com/400x300?text=Trio+Emlak'
        : imageUrl;

    return (
        <div className="listing-card">
            <div className="listing-image-container">
                <img
                    src={displayImage}
                    alt={title}
                    className="listing-image"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="250"
                    onError={(e) => {
                        if (e.target.src !== 'https://via.placeholder.com/400x300?text=Resim+Yok') {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Resim+Yok';
                        }
                    }}
                />
                <span className="listing-tag">{type}</span>
                {score && parseInt(score) > 0 && (
                    <span className="listing-score" title="Fırsat Puanı">
                        ★ {score}
                    </span>
                )}
                <div className="listing-overlay">
                    <button className="view-details-btn">İncele</button>
                </div>
            </div>
            <div className="listing-content">
                <h3 className="listing-title" title={title}>{title}</h3>
                <p className="listing-location">
                    <span className="icon">📍</span> {location || 'Ayvalık'}
                </p>
                <div className="listing-features">
                    {room && <span>{room}</span>}
                    {room && area && <span className="separator">•</span>}
                    {area && <span>{area}</span>}
                </div>
                <div className="listing-footer">
                    <span className="listing-price">{price}</span>
                    <button className="like-btn" title="Favorilere Ekle">
                        🤍
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
