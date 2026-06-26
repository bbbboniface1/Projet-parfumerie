const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { sendOrderConfirmation, sendContactNotification } = require('../lib/mailer');

const PER_PAGE = 12;

// GET / — accueil avec filtres catégorie + pagination
router.get('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const search = req.query.q || '';
        const categorie = req.query.categorie || '';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const offset = (page - 1) * PER_PAGE;

        let conditions = [];
        let params = [];

        if (search) { conditions.push('nom LIKE ?'); params.push(`%${search}%`); }
        if (categorie) { conditions.push('id_categorie = ?'); params.push(parseInt(categorie)); }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

        const [[{ total }]] = await connection.execute(
            `SELECT COUNT(*) AS total FROM produits ${where}`, params
        );
        const totalPages = Math.ceil(total / PER_PAGE);

        const [produits] = await connection.execute(
            `SELECT * FROM produits ${where} ORDER BY nom ASC LIMIT ${PER_PAGE} OFFSET ${offset}`,
            params
        );

        res.render('index', {
            title: 'Accueil',
            produits, searchTerm: search, categorie,
            page, totalPages
        });
    } catch (err) {
        req.log.error(err, 'Erreur GET /');
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /produit/:id
router.get('/produit/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        const [autres] = await connection.execute('SELECT * FROM produits WHERE id != ? ORDER BY RAND() LIMIT 4', [req.params.id]);
        if (!produits.length) return res.status(404).render('errors/404', { title: 'Page introuvable' });
        res.render('produit', { title: produits[0].nom, produit: produits[0], autres });
    } catch (err) {
        req.log.error(err, 'Erreur GET /produit/:id');
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /atelier
router.get('/atelier', (req, res) => {
    res.render('atelier', { title: 'Atelier' });
});

// GET /contact
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact', success: req.query.message === 'envoyé', errors: [] });
});

// POST /contact
router.post('/contact', [
    body('nom').trim().notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
    body('sujet').trim().notEmpty().withMessage('Le sujet est requis.'),
    body('contenu').trim().notEmpty().withMessage('Le message est requis.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact', { title: 'Contact', success: false, errors: errors.array() });
    }
    const connection = await pool.getConnection();
    try {
        const { nom, email, sujet, contenu } = req.body;
        await connection.execute(
            'INSERT INTO messages (nom, email, sujet, contenu) VALUES (?, ?, ?, ?)',
            [nom, email, sujet, contenu]
        );
        sendContactNotification({ nom, email, sujet, contenu }).catch(err =>
            req.log.warn(err, 'Email notification contact échoué')
        );
        res.redirect('/contact?message=envoyé');
    } catch (err) {
        req.log.error(err, 'Erreur POST /contact');
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /commande
router.get('/commande', (req, res) => {
    if (!req.session.cart || !req.session.cart.length) return res.redirect('/panier');
    const totalAmount = req.session.cart.reduce((t, i) => t + i.prix * i.qty, 0);
    res.render('commande', { title: 'Commander', cart: req.session.cart, totalAmount, errors: [] });
});

// POST /commande — transaction + stock guard + email confirmation
router.post('/commande', [
    body('nom').trim().notEmpty().withMessage('Le nom est requis.'),
    body('telephone').trim().notEmpty().withMessage('Le téléphone est requis.'),
    body('adresse').trim().notEmpty().withMessage("L'adresse est requise."),
    body('ville').trim().notEmpty().withMessage('La ville est requise.'),
    body('codepostal').trim().notEmpty().withMessage('Le code postal est requis.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const totalAmount = (req.session.cart || []).reduce((t, i) => t + i.prix * i.qty, 0);
        return res.render('commande', { title: 'Commander', cart: req.session.cart, totalAmount, errors: errors.array() });
    }
    const connection = await pool.getConnection();
    try {
        const { nom, telephone, email, adresse, ville, codepostal, paiement } = req.body;
        const cart = req.session.cart;
        if (!cart || !cart.length) return res.redirect('/panier');
        const total = cart.reduce((s, i) => s + i.prix * i.qty, 0);
        const articlesJSON = JSON.stringify(cart);

        await connection.beginTransaction();
        for (const item of cart) {
            const [r] = await connection.execute(
                'UPDATE produits SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [item.qty, item.id, item.qty]
            );
            if (!r.affectedRows) {
                await connection.rollback();
                req.session.toast = { type: 'danger', msg: `Stock insuffisant pour "${item.nom}". Commande annulée.` };
                return res.redirect('/panier');
            }
        }
        const [result] = await connection.execute(
            'INSERT INTO commandes (nom, telephone, adresse, ville, codepostal, total, articles, paiement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, telephone, adresse, ville, codepostal, total, articlesJSON, paiement || 'A la livraison']
        );
        await connection.commit();

        sendOrderConfirmation({
            nom,
            email: email || null,
            commande: { id: result.insertId, articles: cart, total, paiement: paiement || 'A la livraison' }
        }).catch(err => req.log.warn(err, 'Email confirmation commande échoué'));

        req.session.cart = null;
        res.redirect('/merci');
    } catch (err) {
        await connection.rollback();
        req.log.error(err, 'Erreur POST /commande');
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /merci
router.get('/merci', (req, res) => {
    res.render('merci', { title: 'Merci' });
});

module.exports = router;
