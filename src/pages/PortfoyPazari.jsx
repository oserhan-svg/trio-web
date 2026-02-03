import React from 'react';
import './PageStyles.css';

const PortfoyPazari = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Portföy Pazarı</h1>
                <p>Portföyümüze yeni eklenen gayrimenkullerden ilk önce siz haberdar olun!</p>
            </div>

            <div className="content-section">
                <div className="subscription-card">
                    <h2>Bana Haber Ver!</h2>
                    <p className="highlight-text">Yeni Portföyler Telefonunuza Gelsin !!</p>

                    <div className="feature-grid">
                        <div className="feature-item">
                            <span className="icon">📹</span>
                            <h3>Canlı Video Sunum</h3>
                            <p>Uzaktaki abonelerimize "Canlı Video Portföy" sunumu yapalım.</p>
                        </div>
                        <div className="feature-item">
                            <span className="icon">📱</span>
                            <h3>WhatsApp Bildirimleri</h3>
                            <p>Artık WhatsApp üzerinden yeni portföylerimiz size ücretsiz gönderilecektir.</p>
                        </div>
                    </div>

                    <a
                        href="https://wa.me/905333786894?text=Merhaba,%20portföy%20haber%20listesine%20katılmak%20istiyorum."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                    >
                        WhatsApp İle Katıl
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PortfoyPazari;
