const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Check if the authorization header exists
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'trio-emlak-super-secret-key-2024';

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next(); // Token is valid, proceed to the route
    } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};

module.exports = authenticateToken;
