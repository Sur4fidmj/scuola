const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize DB
initDb();

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
        return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
