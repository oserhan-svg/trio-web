import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LocationIcon,
    BedIcon,
    AreaIcon,
    ChevronLeftIcon
} from '../components/UI/Icons';
import MetaTags from '../components/MetaTags';
import Lightbox from '../components/UI/Lightbox';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { useNotification } from '../components/UI/NotificationSystem';
import { fetchPropertyDetail } from '../utils/api';
import { formatRooms, formatArea, formatPrice, getListingStatus } from '../utils/listingUtils';
import PageTransition from '../components/UI/PageTransition';
import './PropertyDetails.css';

const PropertyDetails = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const { showNotification } = useNotification();

    // Fetch property data from API using cached utility
    useEffect(() => {
        const loadProperty = async () => {
            try {
                setLoading(true);
                const data = await fetchPropertyDetail(id);
                setProperty(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) loadProperty();
    }, [id]);

    const {
        title = '',
        price = '',
        location = '',
        imageUrl = '',
        gallery = [],
        type = '',
        fullDescription = '',
        description = '',
        specs = {},
        features = [],
        status = 'active'
    } = property || {};

    const beds = formatRooms(description, title);
    const area = formatArea(description, title);
    const { isSold, isPassive } = getListingStatus(id, price, title, description, status);

    // Prepare images with fallbacks
    const displayImage = !imageUrl || imageUrl.includes('placeholder')
        ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'
        : imageUrl;

    // Prepare all images for lightbox (main image + gallery)
    const allImages = useMemo(() => [displayImage, ...gallery], [displayImage, gallery]);

    const openLightbox = useCallback((index) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    }, []);

    const handleWhatsApp = useCallback(() => {
        showNotification('WhatsApp\'a yönlendiriliyorsunuz...');
        window.open(`https://wa.me/905333786894?text=${encodeURIComponent(title + " ilanı hakkında bilgi alabilir miyim?")}`);
    }, [title, showNotification]);

    const handleCall = useCallback(() => {
        showNotification('Arama başlatılıyor...');
        window.location.href = 'tel:+905333786894';
    }, [showNotification]);

    // Verify property has essential data
    const hasEssentialData = property && (property.title || property.id);

    if (loading && !hasEssentialData) {
        return (
            <div className="property-details-container loading">
                <div className="details-header-nav">
                    <div className="skeleton-line" style={{ width: '150px' }}></div>
                </div>
                <div className="details-layout">
                    <div className="visual-section">
                        <SkeletonLoader type="card" count={1} />
                        <div style={{ marginTop: '2rem' }}>
                            <SkeletonLoader type="text" count={1} />
                        </div>
                    </div>
                    <div className="sidebar-section">
                        <SkeletonLoader type="card" count={1} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !hasEssentialData) {
        return (
            <div className="property-not-found">
                <MetaTags title="İlan Bulunamadı | Trio Emlak" />
                <div className="error-content">
                    <span style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>🔍</span>
                    <h2>İlan Bulunamadı</h2>
                    <p>{error || 'Aradığınız ilan mevcut olmayabilir veya yayından kaldırılmış olabilir.'}</p>
                    <Link to="/" className="back-home-btn">Tüm İlanlara Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="property-details-container">
                <MetaTags
                    title={`${title} | ${formatPrice(price)} | Trio Emlak`}
                    description={`${location} konumunda ${type}. ${beds} oda, ${area}. ${description?.substring(0, 100)}...`}
                />

                <Lightbox
                    images={allImages}
                    initialIndex={lightboxIndex}
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                />

                <div className="details-header-nav">
                    <Link to="/" className="back-link">
                        <ChevronLeftIcon size={20} />
                        İlanlara Dön
                    </Link>
                </div>

                <div className="details-layout">
                    {/* Visual Section */}
                    <section className="visual-section">
                        <div className="main-gallery">
                            <motion.div
                                className="primary-image-wrapper"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => openLightbox(0)}
                                style={{ cursor: 'zoom-in' }}
                            >
                                <img src={displayImage} alt={title} className="primary-image" loading="eager" />
                                {(isSold || isPassive) && (
                                    <div className="status-overlay-large">
                                        {isSold ? 'SATILDI' : 'YAYINDA DEĞİL'}
                                    </div>
                                )}
                            </motion.div>

                            <div className="thumbnail-grid">
                                {gallery.slice(0, 4).map((img, index) => (
                                    <motion.div
                                        key={index}
                                        className="thumb-wrapper"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        onClick={() => openLightbox(index + 1)}
                                    >
                                        <img src={img} alt={`${title} ${index + 1}`} loading="lazy" />
                                    </motion.div>
                                ))}
                                {gallery.length > 4 && (
                                    <div className="more-photos-overlay" onClick={() => openLightbox(4)}>
                                        +{gallery.length - 4} Fotoğraf Daha
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="property-content-main">
                            <div className="content-header">
                                <span className="type-badge">{type}</span>
                                <h1 className="details-title">{title}</h1>
                                <p className="details-location">
                                    <LocationIcon size={18} />
                                    {location}
                                </p>
                            </div>

                            <div className="details-description">
                                <h3>Açıklama</h3>
                                <div
                                    className="description-text"
                                    dangerouslySetInnerHTML={{ __html: fullDescription || description }}
                                />
                            </div>

                            {features.length > 0 && (
                                <div className="details-features">
                                    <h3>Özellikler</h3>
                                    <div className="features-grid">
                                        {features.map((feat, i) => (
                                            <div key={i} className="feature-item">
                                                <span className="dot"></span>
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Sidebar Section */}
                    <aside className="sidebar-section">
                        <div className="sticky-sidebar">
                            <div className="price-card-elegant">
                                <div className="price-label">Fiyat</div>
                                <div className="price-value">{formatPrice(price)}</div>

                                <motion.button
                                    className="contact-btn primary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleWhatsApp}
                                >
                                    WhatsApp ile Bilgi Al
                                </motion.button>

                                <motion.button
                                    className="contact-btn secondary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCall}
                                >
                                    Hemen Ara
                                </motion.button>
                            </div>

                            <div className="specs-card-elegant">
                                <h3>Teknik Detaylar</h3>
                                <div className="specs-list">
                                    <div className="spec-row">
                                        <span className="spec-key">Oda Sayısı</span>
                                        <span className="spec-val">{beds}</span>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-key">Metrekare</span>
                                        <span className="spec-val">{area}</span>
                                    </div>
                                    {Object.entries(specs).map(([key, val], i) => (
                                        <div key={i} className="spec-row">
                                            <span className="spec-key">{key}</span>
                                            <span className="spec-val">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="agent-card-elegant">
                                <div className="agent-info">
                                    <div className="agent-avatar">TP</div>
                                    <div>
                                        <div className="agent-name">Trio Prime Gayrimenkul</div>
                                        <div className="agent-title">Profesyonel Danışmanlık</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Mobile Sticky Bar */}
                <div className="mobile-contact-bar">
                    <div className="mobile-price">{formatPrice(price)}</div>
                    <div className="mobile-actions">
                        <button className="mobile-whatsapp" onClick={handleWhatsApp}>WhatsApp</button>
                        <button className="mobile-call" onClick={handleCall}>Ara</button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default PropertyDetails;
