const rateLimit = {};

/**
 * Extremely lightweight in-memory rate limiter
 */
const rateLimiter = (options) => {
    const { windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = options;
    const hits = new Map();

    return (req, res, next) => {
        const ip = req.ip || req.get('x-forwarded-for') || req.connection.remoteAddress;
        const now = Date.now();

        if (!hits.has(ip)) {
            hits.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const data = hits.get(ip);
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
            return next();
        }

        data.count++;
        if (data.count > max) {
            return res.status(429).json({ error: message });
        }

        next();
    };
};

module.exports = rateLimiter;
