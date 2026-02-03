import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';
import logoLight from '../../assets/logo-light.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-modern">
            <div className="footer-content-modern">
                <div className="footer-column footer-brand-column">
                    <img src={logoLight} alt="Trio Emlak" className="footer-logo-modern" />
                    <p className="footer-description">
                        Ayvalık'ın en güvenilir gayrimenkul danışmanlık firması.
                        15 yılı aşkın tecrübemizle hayalinizdeki evi bulmanızda yanınızdayız.
                    </p>
                    <div className="social-links-modern">
                        <motion.a
                            href="#"
                            className="social-link-modern"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📘
                        </motion.a>
                        <motion.a
                            href="#"
                            className="social-link-modern"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📷
                        </motion.a>
                        <motion.a
                            href="https://wa.me/905333786894"
                            className="social-link-modern"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            💬
                        </motion.a>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Hızlı Linkler</h4>
                    <ul>
                        <li><Link to="/">Ana Sayfa</Link></li>
                        <li><Link to="/satilik-villa">Villalar</Link></li>
                        <li><Link to="/satilik-daire">Daireler</Link></li>
                        <li><Link to="/portfoy-pazari">Portföy Pazarı</Link></li>
                        <li><Link to="/trio-prime">Trio Prime</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Kategoriler</h4>
                    <ul>
                        <li><Link to="/satilik-arsa">Satılık Arsa</Link></li>
                        <li><Link to="/satilik-tas-ev">Satılık Taş Ev</Link></li>
                        <li><Link to="/satilik-zeytinlik">Satılık Zeytinlik</Link></li>
                        <li><Link to="/iletisim">İletişim</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>İletişim</h4>
                    <div className="contact-info-modern">
                        <p>
                            <strong>Adres:</strong><br />
                            Ali Çetinkaya Mahallesi,<br />
                            Abdi İpekçi Caddesi No:15A<br />
                            Ayvalık, Balıkesir
                        </p>
                        <p>
                            <strong>Telefon:</strong><br />
                            <a href="tel:+905333786894">0 533 378 68 94</a><br />
                            <a href="tel:+905524731021">0 552 473 10 21</a>
                        </p>
                        <p>
                            <strong>E-posta:</strong><br />
                            <a href="mailto:trio.emlak.ayvalik@gmail.com">
                                trio.emlak.ayvalik@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-modern">
                <p>&copy; {currentYear} Trio Emlak. Tüm hakları saklıdır.</p>
                <div className="footer-bottom-links">
                    <a href="#">Gizlilik Politikası</a>
                    <span>•</span>
                    <a href="#">Kullanım Koşulları</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
