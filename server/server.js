const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Normalize FRONTEND_URL (remove trailing slash if present)
const FRONTEND_URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*';

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'", "'unsafe-inline'"], // React needs some inline scripts sometimes
        },
    },
}));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register attempts per hour
    message: { message: 'Too many authentication attempts, please try again after an hour' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize DB (async to catch errors)
(async () => {
    try {
        await initDb();
        console.log('[SERVER] Database initialized successfully');
    } catch (err) {
        console.error('[SERVER] Database initialization failed:', err.message);
        console.error('[SERVER] Server will continue but database operations will fail');
    }
})();

// Routes (Placeholders for now)
app.get('/', (req, res) => {
    res.send('School Platform API is running');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const appuntiRoutes = require('./routes/appunti');
app.use('/api/appunti', appuntiRoutes);

const valutazioniRoutes = require('./routes/valutazioni');
app.use('/api/valutazioni', valutazioniRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const twoFARoutes = require('./routes/twoFA');
app.use('/api/2fa', twoFARoutes);

// Fallback 404
app.use((req, res, next) => {
    console.warn(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Resource not found', path: req.url });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    
    if (err instanceof require('multer').MulterError) {
        return res.status(400).json({ message: 'File upload error', error: 'Invalid file format or size' });
    }

    // Sanitize error message for client
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
        message: 'Internal server error', 
        error: isDev ? err.message : 'An unexpected error occurred' 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
