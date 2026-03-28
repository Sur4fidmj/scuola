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
        console.error('[2FA ERROR] setup2FA:', err);
        res.status(500).json({ message: 'Error setting up 2FA', error: 'Database error' });
    }
};

const verifyAndEnable2FA = (req, res) => {
    const { token } = req.body;

    db.get(`SELECT two_fa_secret FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) {
            console.error('[2FA ERROR] verifyAndEnable2FA (get):', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (!user || !user.two_fa_secret) {
            return res.status(404).json({ message: 'User or 2FA secret not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            // Postgres requires TRUE for boolean columns
            db.run(`UPDATE users SET two_fa_enabled = TRUE WHERE id = ?`, [req.userId], (err) => {
                if (err) {
                    console.error('[2FA ERROR] verifyAndEnable2FA (update):', err);
                    return res.status(500).json({ message: 'Database error' });
                }
                res.json({ message: '2FA enabled successfully' });
            });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    });
};

const disable2FA = (req, res) => {
    // Postgres requires FALSE for boolean columns
    db.run(`UPDATE users SET two_fa_enabled = FALSE, two_fa_secret = NULL WHERE id = ?`, [req.userId], (err) => {
        if (err) {
            console.error('[2FA ERROR] disable2FA:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: '2FA disabled successfully' });
    });
};

module.exports = { setup2FA, verifyAndEnable2FA, disable2FA };
