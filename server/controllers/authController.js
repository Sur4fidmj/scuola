const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { db } = require('../database');
const { sendVerificationEmail, sendPasswordChangeNotification } = require('../services/emailService');
const speakeasy = require('speakeasy');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key_needed';

const register = async (req, res) => {
    const { nome, cognome, email, password } = req.body;
    const ruolo = 'studente';
    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (!nome || !cognome || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (nome, cognome, email, password_hash, ruolo, verification_token) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;

        const result = await db.query(sql, [nome, cognome, email, hash, ruolo, verificationToken]);
        const userId = result.rows[0].id;

        // Send verification email (async)
        sendVerificationEmail(email, verificationToken).catch(console.error);

        res.status(201).json({ message: 'User registered successfully. check your email for verification.', userId });
    } catch (err) {
        if (err.code === '23505') { // Postgres unique violation
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password, twoFAToken } = req.body;

    try {
        const sql = `SELECT * FROM users WHERE email = $1`;
        const user = await db.get(sql, [email]);

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const result = await bcrypt.compare(password, user.password_hash);
        if (!result) return res.status(401).json({ message: 'Invalid credentials' });

        // 2FA Check
        if (user.two_fa_enabled) {
            if (!twoFAToken) {
                return res.status(206).json({ message: '2FA required', userId: user.id });
            }

            const verified = speakeasy.totp.verify({
                secret: user.two_fa_secret,
                encoding: 'base32',
                token: twoFAToken
            });

            if (!verified) {
                return res.status(401).json({ message: 'Invalid 2FA token' });
            }
        }

        const token = jwt.sign({ id: user.id, role: user.ruolo, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, nome: user.nome, cognome: user.cognome, ruolo: user.ruolo, email: user.email, is_verified: user.is_verified, two_fa_enabled: user.two_fa_enabled } });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const sql = `SELECT id, nome, cognome, email, ruolo, is_verified, two_fa_enabled, data_creazione FROM users WHERE id = $1`;
        const user = await db.get(sql, [req.userId]);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const result = await db.query(`UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1`, [token]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'Invalid or expired token' });
        res.json({ message: 'Email verified successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await db.get(`SELECT password_hash, email FROM users WHERE id = $1`, [req.userId]);
        if (!user) return res.status(500).json({ message: 'User not found' });

        const result = await bcrypt.compare(oldPassword, user.password_hash);
        if (!result) return res.status(401).json({ message: 'Incorrect old password' });

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, req.userId]);

        sendPasswordChangeNotification(user.email).catch(console.error);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

module.exports = { register, login, getMe, verifyEmail, changePassword };
