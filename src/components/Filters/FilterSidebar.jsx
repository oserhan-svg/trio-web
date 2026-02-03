import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { VillaIcon, DaireIcon, TasEvIcon, ArsaIcon, ZeytinlikIcon } from '../UI/Icons';
import './FilterSidebar.css';

const FilterSidebar = memo(({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: '',
        priceMin: 0,
        priceMax: 50000000,
        bedrooms: '',
        amenities: []
    });

    const categories = [
        {
            id: 'satilik-villa',
            label: 'Villa',
            icon: <VillaIcon />
        },
        {
            id: 'satilik-daire',
            label: 'Daire',
            icon: <DaireIcon />
        },
        {
            id: 'satilik-tas-ev',
            label: 'Taş Ev',
            icon: <TasEvIcon />
        },
        {
            id: 'satilik-arsa',
            label: 'Arsa',
            icon: <ArsaIcon />
        },
        {
            id: 'satilik-zeytinlik',
            label: 'Zeytinlik',
            icon: <ZeytinlikIcon />
        }
    ];

    const bedroomOptions = ['1', '2', '3', '4', '5+'];

    const amenitiesList = [
        { id: 'pool', label: 'Havuz' },
        { id: 'garden', label: 'Bahçe' },
        { id: 'parking', label: 'Otopark' },
        { id: 'sea-view', label: 'Deniz Manzarası' }
    ];

    const handleCategoryChange = useCallback((category) => {
        setFilters(prev => {
            const newFilters = { ...prev, category: prev.category === category ? '' : category };
            onFilterChange?.(newFilters);
            return newFilters;
        });
    }, [onFilterChange]);

    const handleBedroomChange = useCallback((bedroom) => {
        setFilters(prev => {
            const newFilters = { ...prev, bedrooms: prev.bedrooms === bedroom ? '' : bedroom };
            onFilterChange?.(newFilters);
            return newFilters;
        });
    }, [onFilterChange]);

    const handleAmenityToggle = useCallback((amenity) => {
        setFilters(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            const newFilters = { ...prev, amenities: newAmenities };
            onFilterChange?.(newFilters);
            return newFilters;
        });
    }, [onFilterChange]);

    const handleReset = useCallback(() => {
        const resetFilters = {
            category: '',
            priceMin: 0,
            priceMax: 50000000,
            bedrooms: '',
            amenities: []
        };
        setFilters(resetFilters);
        onFilterChange?.(resetFilters);
    }, [onFilterChange]);

    return (
        <motion.aside
            className="filter-sidebar-elegant"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            role="search"
            aria-label="İlan Filtreleri"
        >
            <div className="filter-header-elegant">
                <h3>Filtreler</h3>
                <motion.button
                    className="reset-btn-elegant"
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Filtreleri Sıfırla"
                >
                    Sıfırla
                </motion.button>
            </div>

            <div className="filter-section-elegant">
                <h4 className="filter-section-title-elegant" id="category-filter-label">Emlak Tipi</h4>
                <div className="category-grid-elegant" role="group" aria-labelledby="category-filter-label">
                    {categories.map((cat) => (
                        <motion.button
                            key={cat.id}
                            className={`category-btn-elegant ${filters.category === cat.id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(cat.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            aria-pressed={filters.category === cat.id}
                        >
                            <span className="category-icon-elegant">{cat.icon}</span>
                            <span className="category-label-elegant">{cat.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="filter-section-elegant">
                <h4 className="filter-section-title-elegant" id="price-filter-label">Fiyat Aralığı</h4>
                <div className="price-display-elegant" aria-live="polite">
                    <span>{(filters.priceMin / 1000000).toFixed(0)}M ₺</span>
                    <span>—</span>
                    <span>{(filters.priceMax / 1000000).toFixed(0)}M ₺</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="1000000"
                    value={filters.priceMax}
                    onChange={(e) => {
                        const newFilters = { ...filters, priceMax: parseInt(e.target.value) };
                        setFilters(newFilters);
                        onFilterChange?.(newFilters);
                    }}
                    className="price-slider-elegant"
                    aria-labelledby="price-filter-label"
                />
            </div>

            <div className="filter-section-elegant">
                <h4 className="filter-section-title-elegant" id="bedroom-filter-label">Oda Sayısı</h4>
                <div className="bedroom-grid-elegant" role="group" aria-labelledby="bedroom-filter-label">
                    {bedroomOptions.map((bed) => (
                        <motion.button
                            key={bed}
                            className={`bedroom-btn-elegant ${filters.bedrooms === bed ? 'active' : ''}`}
                            onClick={() => handleBedroomChange(bed)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-pressed={filters.bedrooms === bed}
                        >
                            {bed}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="filter-section-elegant">
                <h4 className="filter-section-title-elegant">Özellikler</h4>
                <div className="amenities-list-elegant">
                    {amenitiesList.map((amenity) => (
                        <label key={amenity.id} className="amenity-checkbox-elegant">
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity.id)}
                                onChange={() => handleAmenityToggle(amenity.id)}
                            />
                            <span>{amenity.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <motion.button
                className="apply-filters-btn-elegant"
                whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(26, 54, 93, 0.15)' }}
                whileTap={{ scale: 0.98 }}
            >
                Filtreleri Uygula
            </motion.button>
        </motion.aside>
    );
});

FilterSidebar.propTypes = {
    onFilterChange: PropTypes.func
};

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
