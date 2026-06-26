const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /panier
router.get('/', (req, res) => {
    res.render('panier', { title: 'Mon Panier', cart: req.session.cart });
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
        if (existing) { existing.qty++; } else {
            req.session.cart.push({ id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, qty: 1 });
        }
        req.session.toast = { type: 'success', msg: `"${produit.nom}" ajouté au panier !` };
        // AJOUT ÉTAPE 8.1 : rediriger vers la page précédente
        res.redirect(req.headers.referer || '/');
    } catch (err) {
        console.error('Erreur POST /panier/ajouter :', err);
        res.send('Erreur ajout panier');
    } finally {
        connection.release();
    }
});

// POST /panier/supprimer/:id
router.post('/supprimer/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(i => i.id != req.params.id);
    }
    res.redirect('/panier');
});

module.exports = router;
