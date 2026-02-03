import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SearchHero.css';

const SearchHero = () => {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        location: '',
        propertyType: '',
        priceRange: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchData.propertyType) {
            navigate(`/${searchData.propertyType}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <section
            className="search-hero-elegant"
            style={{
                backgroundImage: 'linear-gradient(rgba(26, 54, 93, 0.85), rgba(26, 54, 93, 0.5)), url("/images/ayvalik-hero.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <motion.div
                className="search-hero-content-elegant"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="hero-badge-elegant" variants={itemVariants}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Ayvalık'ın Prestij Gayrimenkul Danışmanı</span>
                </motion.div>

                <motion.h1 className="hero-title-elegant" variants={itemVariants}>
                    Hayalinizdeki Yuvayı<br />
                    <span className="gradient-text-elegant">Birlikte Bulalım</span>
                </motion.h1>

                <motion.p className="hero-subtitle-elegant" variants={itemVariants}>
                    15 yıllık deneyimimizle size özel seçilmiş 44+ premium gayrimenkul
                </motion.p>

                <motion.form
                    className="search-form-elegant"
                    onSubmit={handleSearch}
                    variants={itemVariants}
                >
                    <div className="search-field-group-elegant">
                        <div className="search-field-elegant">
                            <svg className="field-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Konum (Ayvalık, Cunda, Sarımsaklı...)"
                                value={searchData.location}
                                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                                className="search-input-elegant"
                            />
                        </div>

                        <div className="search-divider-elegant"></div>

                        <div className="search-field-elegant">
                            <svg className="field-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <select
                                value={searchData.propertyType}
                                onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                                className="search-select-elegant"
                            >
                                <option value="">Emlak Tipi</option>
                                <option value="satilik-villa">Villa</option>
                                <option value="satilik-daire">Daire</option>
                                <option value="satilik-tas-ev">Taş Ev</option>
                                <option value="satilik-arsa">Arsa</option>
                                <option value="satilik-zeytinlik">Zeytinlik</option>
                            </select>
                        </div>

                        <div className="search-divider-elegant"></div>

                        <div className="search-field-elegant">
                            <svg className="field-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <select
                                value={searchData.priceRange}
                                onChange={(e) => setSearchData({ ...searchData, priceRange: e.target.value })}
                                className="search-select-elegant"
                            >
                                <option value="">Fiyat Aralığı</option>
                                <option value="0-5">0 - 5M ₺</option>
                                <option value="5-10">5M - 10M ₺</option>
                                <option value="10-15">10M - 15M ₺</option>
                                <option value="15+">15M+ ₺</option>
                            </select>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="search-btn-elegant"
                        whileHover={{ scale: 1.02, boxShadow: '0 12px 24px rgba(26, 54, 93, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        Ara
                    </motion.button>
                </motion.form>

                <motion.div className="hero-stats-elegant" variants={itemVariants}>
                    <div className="stat-item-elegant">
                        <span className="stat-number-elegant">44+</span>
                        <span className="stat-label-elegant">Aktif İlan</span>
                    </div>
                    <div className="stat-divider-elegant"></div>
                    <div className="stat-item-elegant">
                        <span className="stat-number-elegant">100+</span>
                        <span className="stat-label-elegant">Mutlu Müşteri</span>
                    </div>
                    <div className="stat-divider-elegant"></div>
                    <div className="stat-item-elegant">
                        <span className="stat-number-elegant">15+</span>
                        <span className="stat-label-elegant">Yıl Tecrübe</span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default SearchHero;
