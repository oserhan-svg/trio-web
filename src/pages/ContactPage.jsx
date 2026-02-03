import React from 'react';
import './PageStyles.css';

const ContactPage = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>İletişim</h1>
                <p>Sorularınız ve talepleriniz için bize ulaşın.</p>
            </div>

            <div className="content-section" style={{ gap: '4rem', flexDirection: 'row', flexWrap: 'wrap' }}>
                <div className="contact-info">
                    <div className="info-block">
                        <h3>Adres</h3>
                        <p>Ali Çetinkaya Mahallesi, Abdi İpekçi Caddesi No:15A<br />Ayvalık, Balıkesir</p>
                    </div>
                    <div className="info-block">
                        <h3>Telefon</h3>
                        <p>
                            <a href="tel:+905333786894">0 533 378 68 94</a><br />
                            <a href="tel:+905524731021">0 552 473 10 21</a>
                        </p>
                    </div>
                    <div className="info-block">
                        <h3>E-posta</h3>
                        <p><a href="mailto:trio.emlak.ayvalik@gmail.com">trio.emlak.ayvalik@gmail.com</a></p>
                    </div>
                </div>

                <div className="contact-form-container" style={{ flex: 1, minWidth: '300px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
                    <h2>Bize Yazın</h2>
                    <form className="contact-form">
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Adınız Soyadınız</label>
                            <input type="text" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>E-posta Adresiniz</label>
                            <input type="email" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mesajınız</label>
                            <textarea rows="4" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                        </div>
                        <button type="button" className="contact-btn primary" style={{ width: '100%' }}>Gönder</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
