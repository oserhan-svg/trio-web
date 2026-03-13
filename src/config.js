/**
 * Application Configuration
 */
const config = {
    // API base URL for development and production
    // Automatically switch between localhost and production server based on current domain
    API_BASE_URL: (function () {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'trio-web-client.onrender.com' || hostname === 'trio-emlak.com') {
                return 'https://trio-web-server.onrender.com/api';
            }
        }
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        }
        return 'http://localhost:5000/api';
    })(),

    // Cache configuration
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes

    // Contact information
    CONTACT_PHONE: '+905333786894',
    CONTACT_WHATSAPP: '905333786894'
};

export default config;
