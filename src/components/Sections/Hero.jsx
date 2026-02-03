import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import heroBg from '../../assets/hero-bg.png';

const Hero = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('satilik-villa');

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/${searchType}`);
    };

    return (
        <section className="hero-modern">
            <div
                className="hero-background"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content-modern">
                <div className="hero-text">
                    <span className="hero-label">Ayvalık Emlak</span>
                    <h1 className="hero-title-modern">
                        Ege'nin İncisinde<br />
                        <span className="highlight">Hayalinizdeki Ev</span>
                    </h1>
                    <p className="hero-subtitle-modern">
                        Doğanın kalbinde modern yaşamın konforunu keşfedin
                    </p>
                </div>

                <div className="search-container">
                    <form onSubmit={handleSearch} className="search-bar">
                        <div className="search-field">
                            <span className="search-icon">🔍</span>
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="search-select"
                            >
                                <option value="satilik-villa">Satılık Villa</option>
                                <option value="satilik-daire">Satılık Daire</option>
                                <option value="satilik-tas-ev">Satılık Taş Ev</option>
                                <option value="satilik-arsa">Satılık Arsa</option>
                                <option value="satilik-zeytinlik">Satılık Zeytinlik</option>
                            </select>
                        </div>
                        <button type="submit" className="search-btn">
                            Ara
                        </button>
                    </form>

                    <div className="quick-stats">
                        <div className="stat">
                            <span className="stat-number">44+</span>
                            <span className="stat-label">İlan</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">5</span>
                            <span className="stat-label">Kategori</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">100+</span>
                            <span className="stat-label">Mutlu Müşteri</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator-modern">
                <span>Keşfet</span>
                <div className="scroll-arrow">↓</div>
            </div>
        </section>
    );
};

export default Hero;
