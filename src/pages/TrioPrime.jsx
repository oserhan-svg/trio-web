import React from 'react';
import './PageStyles.css';

const TrioPrime = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <span className="premium-badge">Exclusive</span>
                <h1>Trio Prime</h1>
                <p>Ayvalık'ın en seçkin ve özel gayrimenkul koleksiyonu.</p>
            </div>

            <div className="content-section" style={{ flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div className="prime-placeholder">
                    <h2>Çok Yakında</h2>
                    <p>Size özel, gizli portföylerimiz için lütfen doğrudan iletişime geçin.</p>
                    <a href="/iletisim" className="contact-btn primary" style={{ marginTop: '1rem' }}>Bize Ulaşın</a>
                </div>
            </div>
        </div>
    );
};

export default TrioPrime;
