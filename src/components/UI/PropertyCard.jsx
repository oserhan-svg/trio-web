import { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HeartIcon, LocationIcon, BedIcon, AreaIcon } from './Icons';
import { useNotification } from './NotificationSystem';
import { prefetchProperty } from '../../utils/api';
import {
    formatRooms,
    formatArea,
    formatPrice,
    calculateUnitPrice,
    getListingStatus
} from '../../utils/listingUtils';
import './PropertyCard.css';

const PropertyCard = memo(({ id, title, price, location, imageUrl, type, description, isFavorite, onToggleFavorite, status = 'active' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const displayImage = imgError || !imageUrl || imageUrl.includes('placeholder')
        ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'
        : imageUrl;

    // Responsive image logic for Unsplash
    const isUnsplash = displayImage.includes('unsplash.com');
    const getSrcSet = (url) => {
        if (!isUnsplash) return null;
        // Strip existing width param if any
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?auto=format&fit=crop&q=70&w=400 400w, ${baseUrl}?auto=format&fit=crop&q=70&w=800 800w, ${baseUrl}?auto=format&fit=crop&q=70&w=1200 1200w`;
    };

    const srcSet = getSrcSet(displayImage);
    const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

    const beds = formatRooms(description, title);
    const area = formatArea(description, title);
    const unitPrice = calculateUnitPrice(price, description, title);
    const { isSold, isPassive, isNew, isFirsat, isPremium } = getListingStatus(id, price, title, description, status);

    const handleNavigate = () => {
        if (!isPassive) {
            navigate(`/ilan/${id}`);
        }
    };

    const handleMouseEnter = () => {
        if (!isPassive) {
            prefetchProperty(id);
        }
    };

    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        onToggleFavorite(id);
        showNotification(isFavorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi');
    }, [id, isFavorite, onToggleFavorite, showNotification]);

    return (
        <motion.div
            className={`property-card-elegant status-${status}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={!isPassive ? { y: -8 } : {}}
            onClick={handleNavigate}
            onMouseEnter={handleMouseEnter} // Trigger prefetching
        >
            <div className="property-image-wrapper-elegant">
                {!imageLoaded && <div className="skeleton-loader-elegant"></div>}

                <motion.img
                    src={displayImage}
                    srcSet={srcSet}
                    sizes={sizes}
                    alt={title}
                    className="property-image-elegant"
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImgError(true);
                        setImageLoaded(true);
                    }}
                    whileHover={!isPassive ? { scale: 1.08 } : {}}
                    transition={{ duration: 0.6 }}
                />

                <div className="image-overlay-gradient-elegant"></div>

                <div className="badge-container-elegant">
                    {isSold && <span className="property-badge-elegant status-sold">Satıldı</span>}
                    {isPassive && !isSold && <span className="property-badge-elegant status-passive">Yayında Değil</span>}
                    {isNew && <span className="property-badge-elegant status-new">Yeni İlan</span>}
                    {isFirsat && <span className="property-badge-elegant status-deal">Fırsat</span>}
                    {isPremium && <span className="property-badge-elegant">Premium</span>}
                </div>

                <div className="property-price-overlay-elegant">
                    {formatPrice(price)}
                    {unitPrice && <span className="unit-price-elegant">{unitPrice}</span>}
                </div>

                {!isPassive && (
                    <motion.button
                        className={`favorite-btn-elegant ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavoriteClick}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    >
                        <HeartIcon size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </motion.button>
                )}
            </div>

            <div className="property-card-content-elegant">
                <div className="property-type-label-elegant">{type?.replace('Satılık ', '') || 'Emlak'}</div>

                <h3 className="property-title-elegant" title={title}>
                    {title}
                </h3>

                <p className="property-location-elegant">
                    <LocationIcon size={14} />
                    {location || 'Ayvalık'}
                </p>

                <div className="property-specs-elegant">
                    <div className="spec-item-elegant" title="Oda Sayısı">
                        <BedIcon size={18} />
                        <span>{beds}</span>
                    </div>
                    <div className="spec-item-elegant" title="Metrekare">
                        <AreaIcon size={18} />
                        <span>{area}</span>
                    </div>
                </div>

                <div className="property-card-footer-elegant">
                    <motion.button
                        className="view-details-btn-elegant"
                        whileHover={!isPassive ? { backgroundColor: 'var(--color-primary-dark)' } : {}}
                        whileTap={!isPassive ? { scale: 0.98 } : {}}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate();
                        }}
                        disabled={isPassive}
                    >
                        {isPassive ? 'Yayında Değil' : 'Detayları Gör'}
                        {!isPassive && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14m-7-7 7 7-7 7" />
                            </svg>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
});

PropertyCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    location: PropTypes.string,
    imageUrl: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    isFavorite: PropTypes.bool,
    onToggleFavorite: PropTypes.func,
    status: PropTypes.string
};

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
