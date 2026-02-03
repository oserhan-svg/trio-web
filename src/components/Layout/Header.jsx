import { useState, useEffect, memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { HeartIcon, UserIcon, PlusIcon, MenuIcon, CloseIcon } from '../UI/Icons';
import './Header.css';
import logoDark from '../../assets/logo-dark.png';

const Header = memo(() => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // If the sentinel (top ~20px) is NOT intersecting, we have scrolled past it
            setScrolled(!entry.isIntersecting);
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0
        });

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
        };
    }, []);

    const prefetchMap = {
        '/': () => import('../../pages/Home'),
        '/satilik-villa': () => import('../../pages/CategoryPage'),
        '/satilik-daire': () => import('../../pages/CategoryPage'),
        '/portfoy-pazari': () => import('../../pages/PortfoyPazari'),
        '/iletisim': () => import('../../pages/ContactPage'),
        '/firsatlar': () => import('../../pages/ExternalListings'),
        '/admin': () => import('../../pages/AdminDashboard'),
        '/hesabim': () => import('../../pages/UserControl')
    };

    const handlePrefetch = (path) => {
        const prefetcher = prefetchMap[path];
        if (prefetcher) {
            prefetcher().catch(() => { });
        }
    };

    return (
        <>
            <div
                ref={sentinelRef}
                className="scroll-sentinel"
                style={{ position: 'absolute', top: 0, left: 0, height: '20px', width: '100%', pointerEvents: 'none', zIndex: -1, background: 'transparent' }}
                aria-hidden="true"
            />
            <motion.header
                className={`header-elegant ${scrolled ? 'scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="header-container-elegant">
                    <Link
                        to="/"
                        className="logo-elegant"
                        aria-label="Anasayfa"
                        onMouseEnter={() => handlePrefetch('/')}
                    >
                        <motion.img
                            src={logoDark}
                            alt="Trio Emlak"
                            className="logo-img-elegant"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        />
                    </Link>

                    <nav className="nav-elegant" aria-label="Ana Navigasyon">
                        <Link to="/" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/')}>Anasayfa</Link>
                        <Link to="/satilik-villa" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/satilik-villa')}>Villalar</Link>
                        <Link to="/satilik-daire" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/satilik-daire')}>Daireler</Link>
                        <Link to="/portfoy-pazari" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/portfoy-pazari')}>Portföy</Link>
                        <Link to="/firsatlar" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/firsatlar')}>Fırsatlar</Link>
                        <Link to="/iletisim" className="nav-link-elegant" onMouseEnter={() => handlePrefetch('/iletisim')}>İletişim</Link>
                    </nav>

                    <div className="header-actions-elegant">
                        <motion.button
                            className="icon-btn-elegant"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Favoriler"
                            aria-label="Favorilerim"
                        >
                            <HeartIcon size={20} />
                        </motion.button>
                        <Link
                            to="/admin"
                            className="icon-btn-elegant"
                            title="Profil"
                            aria-label="Profilim"
                            onMouseEnter={() => handlePrefetch('/admin')}
                        >
                            <UserIcon size={20} />
                        </Link>
                        <motion.button
                            className="btn-add-property-elegant"
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(26, 54, 93, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <PlusIcon size={18} />
                            İlan Ekle
                        </motion.button>
                    </div>

                    <button
                        className="mobile-menu-btn-elegant"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menüyü Aç/Kapat"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="mobile-menu-elegant"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Anasayfa</Link>
                            <Link to="/satilik-villa" onClick={() => setMobileMenuOpen(false)}>Villalar</Link>
                            <Link to="/satilik-daire" onClick={() => setMobileMenuOpen(false)}>Daireler</Link>
                            <Link to="/portfoy-pazari" onClick={() => setMobileMenuOpen(false)}>Portföy</Link>
                            <Link to="/firsatlar" onClick={() => setMobileMenuOpen(false)}>Fırsatlar</Link>
                            <Link to="/iletisim" onClick={() => setMobileMenuOpen(false)}>İletişim</Link>
                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Panel</Link>
                            <Link to="/hesabim" onClick={() => setMobileMenuOpen(false)}>Favorilerim</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
});

Header.propTypes = {};

Header.displayName = 'Header';

export default Header;
