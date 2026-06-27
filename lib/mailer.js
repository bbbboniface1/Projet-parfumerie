'use strict';
const nodemailer = require('nodemailer');
const logger = require('./logger');

// CORRECTION — transport SMTP robuste avec tls et vérification
function createTransport() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('SMTP non configuré — emails désactivés');
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

// CORRECTION — vérification au démarrage du serveur
async function verifyTransport() {
    const transporter = createTransport();
    if (!transporter) return;
    try {
        await transporter.verify();
        logger.info(`SMTP OK — connecté en tant que ${process.env.SMTP_USER}`);
    } catch (err) {
        logger.error({ err }, `SMTP ERREUR : ${err.message}`);
        logger.error('→ Vérifier SMTP_USER, SMTP_PASS, SMTP_HOST dans .env');
    }
}

async function sendOrderConfirmation({ nom, email, commande }) {
    if (!email) return;
    const transporter = createTransport();
    if (!transporter) return;

    const lignes = commande.articles.map(
        item => `• ${item.nom} × ${item.qty} — ${Number(item.prix * item.qty).toLocaleString('fr-FR')} FCFA`
    ).join('\n');

    try {
        const info = await transporter.sendMail({
            from: `"Sirani Parfumerie" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Confirmation commande #${commande.id} — Sirani Parfumerie`,
            text: [
                `Bonjour ${nom},`,
                '',
                'Merci pour votre commande ! Récapitulatif :',
                '',
                lignes,
                '',
                `Total : ${Number(commande.total).toLocaleString('fr-FR')} FCFA`,
                `Paiement : ${commande.paiement}`,
                '',
                'Nous vous contacterons pour confirmer la livraison.',
                '',
                "L'équipe Sirani Parfumerie"
            ].join('\n'),
            html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#333;">
  <div style="background:#111;padding:20px;text-align:center;">
    <h1 style="color:#d4af37;margin:0;font-size:22px;">Sirani Parfumerie</h1>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#111;">Merci pour votre commande, ${nom} !</h2>
    <p>Commande <strong>#${commande.id}</strong> enregistrée.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px;text-align:left;border-bottom:2px solid #d4af37;">Produit</th>
          <th style="padding:10px;text-align:center;border-bottom:2px solid #d4af37;">Qté</th>
          <th style="padding:10px;text-align:right;border-bottom:2px solid #d4af37;">Sous-total</th>
        </tr>
      </thead>
      <tbody>
        ${commande.articles.map(item => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${item.nom}</td>
          <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">${item.qty}</td>
          <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
            ${Number(item.prix * item.qty).toLocaleString('fr-FR')} FCFA
          </td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px;text-align:right;font-weight:bold;">Total :</td>
          <td style="padding:12px;text-align:right;font-weight:bold;color:#d4af37;">
            ${Number(commande.total).toLocaleString('fr-FR')} FCFA
          </td>
        </tr>
      </tfoot>
    </table>
    <p><strong>Paiement :</strong> ${commande.paiement}</p>
    <p style="color:#666;margin-top:20px;">
      Nous vous contacterons pour confirmer la livraison.
    </p>
  </div>
  <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#999;">
    Sirani Parfumerie — Bamako, Mali
  </div>
</div>`
        });
        logger.info(`Email confirmation envoyé à ${email} — ${info.messageId}`);
    } catch (err) {
        logger.error({ err }, `Échec email confirmation à ${email} : ${err.message}`);
        throw err;
    }
}

async function sendContactNotification({ nom, email, sujet, contenu }) {
    if (!process.env.ADMIN_EMAIL) return;
    const transporter = createTransport();
    if (!transporter) return;

    try {
        const info = await transporter.sendMail({
            from: `"Sirani Parfumerie" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            replyTo: email,
            subject: `[Contact] ${sujet} — de ${nom}`,
            text: `De : ${nom} <${email}>\n\nSujet : ${sujet}\n\n${contenu}`
        });
        logger.info(`Email contact envoyé — ${info.messageId}`);
    } catch (err) {
        logger.error({ err }, `Échec email contact : ${err.message}`);
        throw err;
    }
}

module.exports = { sendOrderConfirmation, sendContactNotification, verifyTransport };
