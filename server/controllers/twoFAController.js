const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { db } = require('../database');

const setup2FA = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ name: `ScuolaPlatform (${req.userId})` });

        // Save secret temporarily (not enabled yet)
        db.run(`UPDATE users SET two_fa_secret = ? WHERE id = ?`, [secret.base32, req.userId], async (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
            res.json({ qrCode: qrCodeUrl, secret: secret.base32 });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error setting up 2FA', error: err.message });
    }
};

const verifyAndEnable2FA = (req, res) => {
    const { token } = req.body;

    db.get(`SELECT two_fa_secret FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            db.run(`UPDATE users SET two_fa_enabled = 1 WHERE id = ?`, [req.userId], (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: '2FA enabled successfully' });
            });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    });
};

const disable2FA = (req, res) => {
    db.run(`UPDATE users SET two_fa_enabled = 0, two_fa_secret = NULL WHERE id = ?`, [req.userId], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: '2FA disabled successfully' });
    });
};

module.exports = { setup2FA, verifyAndEnable2FA, disable2FA };
