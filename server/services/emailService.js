const nodemailer = require('nodemailer');

// Configure transporter
// For IONOS: smtp.ionos.it, port 587, auth: user/pass
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.it',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER || 'support@king-hosting.it',
        pass: process.env.SMTP_PASS || 'G@4Br13l309uM@gG',
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"ScuolaPlatform" <${process.env.SMTP_USER || 'no-reply@scuola.test'}>`,
            to,
            subject,
            html,
        });
        console.log(`[EMAIL] Sent: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error('[EMAIL ERROR]', err);
        throw err;
    }
};

const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.FRONTEND_URL || 'https://king-hosting.it'}/verify-email?token=${token}`;
    const html = `
        <h1>Benvenuto su ScuolaPlatform!</h1>
        <p>Grazie per esserti registrato. Conferma il tuo account cliccando sul pulsante qui sotto:</p>
        <a href="${url}" style="padding: 10px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px;">Verifica Account</a>
        <p>Oppure copia e incolla questo link: ${url}</p>
    `;
    return sendEmail(email, 'Verifica il tuo account - ScuolaPlatform', html);
};

const sendPasswordChangeNotification = async (email) => {
    const html = `
        <h1>Sicurezza Account</h1>
        <p>Ti informiamo che la password del tuo account su ScuolaPlatform è stata modificata con successo.</p>
        <p>Se non sei stato tu, ti preghiamo di contattare immediatamente l'assistenza.</p>
    `;
    return sendEmail(email, 'Notifica Cambio Password - ScuolaPlatform', html);
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordChangeNotification };

