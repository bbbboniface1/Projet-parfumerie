/**
 * Script de test SMTP — Sirani Parfumerie
 * Usage : node test-mail.js
 * Supprimer après vérification.
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
});

console.log(`\n→ Test SMTP avec : ${process.env.SMTP_USER || '(SMTP_USER non défini)'}\n`);

t.verify()
    .then(() => {
        console.log('✅ Connexion SMTP OK\n');
        return t.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: 'Test Sirani Parfumerie — SMTP OK',
            text: 'Email de test envoyé avec succès depuis test-mail.js'
        });
    })
    .then(info => {
        console.log('✅ Email envoyé :', info.messageId);
        console.log('→ Vérifie ta boîte de réception (ou le dossier Spam).\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erreur SMTP :', err.message);
        console.error('\nChecklist :');
        console.error('  1. SMTP_USER et SMTP_PASS définis dans .env (sans espaces)');
        console.error('  2. Validation en 2 étapes activée sur Gmail');
        console.error('  3. Mot de passe d\'application Gmail utilisé (pas le mot de passe du compte)');
        console.error('  → https://myaccount.google.com/apppasswords\n');
        process.exit(1);
    });
