import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * MetaTags component to manage dynamic head elements
 * Updates page title and meta description based on the route
 */
const MetaTags = () => {
    const location = useLocation();

    useEffect(() => {
        const defaultTitle = 'Trio Emlak | Ayvalık\'ın İncisi';
        const defaultDescription = 'Trio Emlak - Ayvalık, Cunda ve Küçükköy\'de satılık gayrimenkul fırsatları.';

        // Mapping of paths to meta information
        const pathMeta = {
            '/': {
                title: 'Trio Emlak | Ayvalık\'ın İncisi - Anasayfa',
                description: 'Ayvalık, Cunda ve Küçükköy\'de satılık villa, taş ev ve arsalar.'
            },
            '/portfoy-pazari': {
                title: 'Portföy Pazarı | Trio Emlak',
                description: 'Güncel gayrimenkul portföyümüzü keşfedin.'
            },
            '/trio-prime': {
                title: 'Trio Prime | Ayrıcalıklı Gayrimenkul Hizmetleri',
                description: 'Lüks ve özel mülkler için Trio Prime hizmetlerini keşfedin.'
            },
            '/iletisim': {
                title: 'İletişim | Trio Emlak',
                description: 'Bize ulaşın ve hayalinizdeki mülkü birlikte bulalım.'
            }
        };

        const currentMeta = pathMeta[location.pathname] || { title: defaultTitle, description: defaultDescription };

        // Set page title
        document.title = currentMeta.title;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', currentMeta.description);
        }

        // Update OG title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', currentMeta.title);
        }
    }, [location]);

    return null; // This component doesn't render anything
};

MetaTags.propTypes = {};

export default MetaTags;
