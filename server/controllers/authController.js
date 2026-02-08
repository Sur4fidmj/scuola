const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { db } = require('../database');
const { sendVerificationEmail, sendPasswordChangeNotification } = require('../services/emailService');
const speakeasy = require('speakeasy');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key_needed';

const register = (req, res) => {
    const { nome, cognome, email, password } = req.body;
    const ruolo = 'studente';
    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (!nome || !cognome || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        const sql = `INSERT INTO users (nome, cognome, email, password_hash, ruolo, verification_token) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [nome, cognome, email, hash, ruolo, verificationToken], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Database error', error: err.message });
            }

            // Send verification email (async, don't block response)
            sendVerificationEmail(email, verificationToken).catch(console.error);

            res.status(201).json({ message: 'User registered successfully. check your email for verification.', userId: this.lastID });
        });
    });
};

const login = (req, res) => {
    const { email, password, twoFAToken } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (err || !result) return res.status(401).json({ message: 'Invalid credentials' });

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
        });
    });
};

const getMe = (req, res) => {
    const sql = `SELECT id, nome, cognome, email, ruolo, is_verified, two_fa_enabled, data_creazione FROM users WHERE id = ?`;
    db.get(sql, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
};

const verifyEmail = (req, res) => {
    const { token } = req.query;
    db.run(`UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?`, [token], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(400).json({ message: 'Invalid or expired token' });
        res.json({ message: 'Email verified successfully!' });
    });
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    db.get(`SELECT password_hash, email FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'User not found' });

        bcrypt.compare(oldPassword, user.password_hash, (err, result) => {
            if (err || !result) return res.status(401).json({ message: 'Incorrect old password' });

            bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) return res.status(500).json({ message: 'Error hashing password' });

                db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.userId], (err) => {
                    if (err) return res.status(500).json({ message: 'Database error' });

                    sendPasswordChangeNotification(user.email).catch(console.error);
                    res.json({ message: 'Password changed successfully' });
                });
            });
        });
    });
};

module.exports = { register, login, getMe, verifyEmail, changePassword };
