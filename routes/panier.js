const express = require('express');
const router = express.Router();
const pool = require('../db');

const WHATSAPP_NUMBER = '22390732894';
const SHOP_URL = process.env.SHOP_URL || 'http://localhost:3000';

// GET /panier
router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    let cartLines = [];
    let totalGeneral = 0;
    cart.forEach(item => {
        const sousTotal = item.prix * item.qty;
        totalGeneral += sousTotal;
        const productUrl = `${SHOP_URL}/produit/${item.id}`;
        cartLines.push(
            `\u2022 *${item.nom}* x${item.qty}`,
            `  Prix unitaire : ${Number(item.prix).toLocaleString('fr-FR')} FCFA`,
            `  Sous-total : ${Number(sousTotal).toLocaleString('fr-FR')} FCFA`,
            `  Lien : ${productUrl}`
        );
    });
    const whatsappCartMessage = [
        `Bonjour Sirani Parfumerie !`,
        ``,
        `Je souhaite commander les articles suivants :`,
        ``,
        ...cartLines,
        ``,
        `*TOTAL : ${Number(totalGeneral).toLocaleString('fr-FR')} FCFA*`,
        ``,
        `Merci de confirmer et de m'indiquer les modalités de livraison.`
    ].join('\n');
    const whatsappCartUrl = cart.length > 0
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappCartMessage)}`
        : '#';
    res.render('panier', { title: 'Mon Panier', cart: req.session.cart, whatsappCartUrl });
});

// POST /panier/ajouter/:id
router.post('/ajouter/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        const produit = produits[0];
        if (!produit) return res.redirect('/');
        if (!req.session.cart) req.session.cart = [];
        const existing = req.session.cart.find(p => p.id === produit.id);
        // CORRECTION — lecture quantité choisie par l'utilisateur
        const qtyDemandee = Math.max(1, parseInt(req.body.qty) || 1);
        if (existing) {
            existing.qty += qtyDemandee;
        } else {
            req.session.cart.push({ id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, qty: qtyDemandee });
        }
        req.session.toast = { type: 'success', msg: `"${produit.nom}" ajouté au panier !` };
        // AJOUT ÉTAPE 8.1 : rediriger vers la page précédente
        res.redirect(req.headers.referer || '/');
    } catch (err) {
        console.error('Erreur POST /panier/ajouter :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// CORRECTION — modifier la quantité d'un article dans le panier
router.post('/modifier/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const qty = parseInt(req.body.qty);
    if (!req.session.cart) return res.redirect('/panier');
    if (isNaN(qty) || qty < 1) {
        req.session.cart = req.session.cart.filter(i => i.id !== id);
    } else {
        const item = req.session.cart.find(i => i.id === id);
        if (item) item.qty = qty;
    }
    res.redirect('/panier');
});

// CORRECTION — vider le panier entier
router.post('/vider', (req, res) => {
    req.session.cart = [];
    req.session.toast = { type: 'info', msg: 'Votre panier a été vidé.' };
    res.redirect('/panier');
});

// POST /panier/supprimer/:id
router.post('/supprimer/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(i => i.id != req.params.id);
    }
    res.redirect('/panier');
});

module.exports = router;
