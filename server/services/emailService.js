const { Resend } = require('resend');

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Generic function to send email via Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `ScuolaPlatform <${FROM_EMAIL}>`,
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('[RESEND ERROR]', error);
            throw new Error(error.message);
        }

        console.log(`[EMAIL] Inviata con successo ID: ${data.id}`);
        return data;
    } catch (err) {
        console.error('[EMAIL ERROR] Impossibile inviare email:', err.message);
        throw err;
    }
};

/**
 * Sends the magic link for pre-registration verification
 */
const sendVerificationEmail = async (email, registrationLink) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #6366f1;">Benvenuto su ScuolaPlatform!</h1>
            <p>Grazie per il tuo interesse. Per completare la registrazione e creare il tuo account, clicca sul pulsante qui sotto:</p>
            <a href="${registrationLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Completa Registrazione</a>
            <p style="color: #666; font-size: 0.9em;">Il link scadrà tra 1 ora. Se non hai richiesto tu la registrazione, puoi ignorare questa email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #999;">Questo è un messaggio automatico, per favore non rispondere.</p>
        </div>
    `;
    return sendEmail(email, 'Conferma la tua email - ScuolaPlatform', html);
};

/**
 * Sends notification after password change
 */
const sendPasswordChangeNotification = async (email) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #f59e0b;">Sicurezza Account</h1>
            <p>Ti informiamo che la password del tuo account su <strong>ScuolaPlatform</strong> è stata modificata con successo.</p>
            <p>Se non sei stato tu ad effettuare questa operazione, contatta immediatamente il supporto tecnico o l'amministratore della scuola.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #999;">Messaggio di sicurezza automatico.</p>
        </div>
    `;
    return sendEmail(email, 'Notifica Cambio Password - ScuolaPlatform', html);
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordChangeNotification };
