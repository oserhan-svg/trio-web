import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchHero from '../components/Sections/SearchHero';
import FilterSidebar from '../components/Filters/FilterSidebar';
import PropertyCard from '../components/UI/PropertyCard';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import VirtualGrid from '../components/UI/VirtualGrid';
import useListings from '../hooks/useListings';
import './Home.css';

const Home = () => {
    const { listings, handleFilterChange, totalCount, toggleFavorite, isFiltering, loading } = useListings();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    return (
        <div className="home-modern">
            {isFiltering && <div className="filtering-progress" />}
            <SearchHero />

            <section className="listings-section" aria-labelledby="listings-title">
                <div className="listings-container">
                    <div className="sidebar-wrapper">
                        <FilterSidebar onFilterChange={handleFilterChange} />
                    </div>

                    <div className="main-content">
                        <div className="listings-header">
                            <div className="listings-info">
                                <h2 id="listings-title">Öne Çıkan İlanlar</h2>
                                <p className="listings-count" aria-live="polite">
                                    {loading ? 'İlanlar taranıyor...' : `${totalCount} ilan bulundu`}
                                </p>
                            </div>

                            <div className="view-controls">
                                <motion.button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Izgara Görünümü"
                                    aria-pressed={viewMode === 'grid'}
                                >
                                    ⊞
                                </motion.button>
                                <motion.button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Liste Görünümü"
                                    aria-pressed={viewMode === 'list'}
                                >
                                    ☰
                                </motion.button>
                                <select className="sort-select" aria-label="Sıralama Seçenekleri">
                                    <option>Sıralama</option>
                                    <option>Fiyat: Düşükten Yükseğe</option>
                                    <option>Fiyat: Yüksekten Düşüğe</option>
                                    <option>En Yeni</option>
                                </select>
                            </div>
                        </div>

                        <div className={`properties-grid ${viewMode}`}>
                            {loading && listings.length === 0 ? (
                                <SkeletonLoader type="card" count={6} />
                            ) : listings.length > 0 ? (
                                <VirtualGrid
                                    items={listings}
                                    rowHeight={viewMode === 'grid' ? 600 : 320}
                                    viewMode={viewMode}
                                    renderItem={(listing) => (
                                        <PropertyCard
                                            {...listing}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    )}
                                />
                            ) : (
                                <div className="no-results">
                                    <span className="no-results-icon" aria-hidden="true">🔍</span>
                                    <h3>İlan Bulunamadı</h3>
                                    <p>Filtrelerinizi değiştirip tekrar deneyin</p>
                                </div>
                            )}
                        </div>

                        {!loading && listings.length > 0 && (
                            <nav className="pagination" aria-label="Sayfalama">
                                <motion.button
                                    className="pagination-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled
                                    aria-label="Önceki Sayfa"
                                >
                                    ← Önceki
                                </motion.button>
                                <div className="page-numbers">
                                    <button className="page-num active" aria-current="page">1</button>
                                    <button className="page-num">2</button>
                                    <button className="page-num">3</button>
                                </div>
                                <motion.button
                                    className="pagination-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Sonraki Sayfa"
                                >
                                    Sonraki →
                                </motion.button>
                            </nav>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
