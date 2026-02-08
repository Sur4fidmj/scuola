const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Bearer <token>
    const tokenParts = token.split(' ');
    const tokenValue = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

    jwt.verify(tokenValue, process.env.JWT_SECRET || 'secret_key_needed', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

module.exports = verifyToken;
