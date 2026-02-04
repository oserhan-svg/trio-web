/**
 * Unified utility functions for listing data parsing and formatting
 */

/**
 * Extracts numeric values safely from text using regex
 * @param {string} text - The text to search
 * @param {RegExp} regex - The regex pattern
 * @returns {string|null} - The matched string or null
 */
export const extractNumber = (text, regex) => {
    const match = text?.match(regex);
    return match ? match[0] : null;
};

/**
 * Parses a price string into a numeric value
 * Supports Turkish comma-separated format
 * @param {string} price - The price string (e.g., "5.500.000 TL")
 * @returns {number} - The numeric price
 */
export const parseNumericPrice = (price) => {
    if (!price) return 0;
    // Extract everything before the comma and remove non-digits
    return parseInt(price.split(',')[0]?.replace(/[^\d]/g, '')) || 0;
};

/**
 * Formats rooms/beds string from description or title
 */
export const formatRooms = (description, title) => {
    return extractNumber(description, /(\d+)\+(\d+)/) ||
        extractNumber(title, /(\d+)\+(\d+)/) ||
        '---';
};

/**
 * Formats area (m2) string from description or title
 */
export const formatArea = (description, title) => {
    const areaRaw = extractNumber(description, /(\d+)\s*m/i) ||
        extractNumber(title, /(\d+)\s*m/i);
    return areaRaw ? areaRaw.toLowerCase().replace(/m/i, ' m²') : '---';
};

/**
 * Formats price string for display by removing decimal parts (e.g., ,00)
 * @param {string} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
    if (!price) return '---';
    return price.replace(/,00(?!\d)/g, '');
};

/**
 * Calculates unit price per m2
 */
export const calculateUnitPrice = (price, description, title) => {
    const numericPrice = parseNumericPrice(price);
    const areaRaw = extractNumber(description, /(\d+)\s*m/i) ||
        extractNumber(title, /(\d+)\s*m/i);
    const numericArea = areaRaw ? parseInt(areaRaw.replace(/[^\d]/g, '')) : 0;

    if (numericPrice > 0 && numericArea > 0) {
        return `₺${Math.floor(numericPrice / numericArea).toLocaleString('tr-TR')} / m²`;
    }
    return null;
};

/**
 * Determines listing status badges
 */
export const getListingStatus = (id, price, title, description, status) => {
    const isSold = status === 'sold';
    const isPassive = status === 'passive';
    const isNew = id > (Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const isFirsat = price?.toLowerCase().includes('fırsat') ||
        title?.toLowerCase().includes('fırsat') ||
        description?.toLowerCase().includes('fırsat');

    return {
        isSold,
        isPassive,
        isNew: isNew && !isPassive && !isSold,
        isFirsat: isFirsat && !isPassive && !isSold,
        isPremium: !isNew && !isFirsat && !isPassive && !isSold
    };
};
