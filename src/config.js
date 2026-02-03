/**
 * Application Configuration
 */
const config = {
    // API base URL for development and production
    // You can also use import.meta.env for Vite environment variables
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

    // Cache configuration
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes

    // Contact information
    CONTACT_PHONE: '+905333786894',
    CONTACT_WHATSAPP: '905333786894'
};

export default config;
