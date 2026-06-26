const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const pool = require('../db');

// Multer : 5 MB + filtre MIME réel
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const storage = multer.diskStorage({
    destination: './public/img',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        ALLOWED_MIME.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Type non autorisé. Utilisez JPEG, PNG ou WebP.'));
    }
});

// GET /admin
router.get('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [commandes] = await connection.execute('SELECT * FROM commandes ORDER BY date_creation DESC');
        const [produits] = await connection.execute('SELECT * FROM produits ORDER BY nom ASC');
        const [messages] = await connection.execute('SELECT * FROM messages ORDER BY date_creation DESC');
        const commandesAvecDetails = commandes.map(c => ({ ...c, articlesList: JSON.parse(c.articles) }));
        let activeTab = req.query.tab === 'products' ? 'products' : req.query.tab === 'messages' ? 'messages' : 'orders';
        res.render('admin', { title: 'Administration', commandes: commandesAvecDetails, produits, messages, activeTab });
    } catch (err) {
        console.error('Erreur GET /admin :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /admin/ajouter-produit
router.get('/ajouter-produit', (req, res) => {
    res.render('ajouter-produit', { title: 'Ajouter un produit', errors: [] });
});

// POST /admin/ajouter-produit
router.post('/ajouter-produit', upload.single('image'), [
    body('nom').trim().notEmpty().withMessage('Le nom est requis.'),
    body('prix').isFloat({ min: 0 }).withMessage('Prix invalide.'),
    body('description').trim().notEmpty().withMessage('La description est requise.'),
    body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif.'),
    body('id_categorie').isInt({ min: 1, max: 3 }).withMessage('Catégorie invalide.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.render('ajouter-produit', { title: 'Ajouter un produit', errors: errors.array() });
    const connection = await pool.getConnection();
    try {
        const { nom, prix, description, id_categorie, stock } = req.body;
        const image = req.file ? req.file.filename : 'default.jpg';
        await connection.execute(
            'INSERT INTO produits (nom, prix, description, image, id_categorie, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prix, description, image, id_categorie, parseInt(stock)]
        );
        res.redirect('/admin?tab=products');
    } catch (err) {
        console.error('Erreur POST /admin/ajouter-produit :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// POST /admin/supprimer-produit/:id
router.post('/supprimer-produit/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.execute('DELETE FROM produits WHERE id = ?', [req.params.id]);
        res.redirect('/admin?tab=products');
    } catch (err) {
        console.error('Erreur POST /admin/supprimer-produit :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /admin/modifier-produit/:id
router.get('/modifier-produit/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        if (!produits.length) return res.status(404).render('errors/404', { title: 'Page introuvable' });
        res.render('modifier-produit', { title: 'Modifier produit', produit: produits[0], errors: [] });
    } catch (err) {
        console.error('Erreur GET /admin/modifier-produit :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// POST /admin/modifier-produit/:id
router.post('/modifier-produit/:id', upload.single('image'), [
    body('nom').trim().notEmpty().withMessage('Le nom est requis.'),
    body('prix').isFloat({ min: 0 }).withMessage('Prix invalide.'),
    body('description').trim().notEmpty().withMessage('La description est requise.'),
    body('id_categorie').isInt({ min: 1, max: 3 }).withMessage('Catégorie invalide.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const connection = await pool.getConnection();
        try {
            const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
            return res.render('modifier-produit', { title: 'Modifier produit', produit: produits[0], errors: errors.array() });
        } finally { connection.release(); }
    }
    const connection = await pool.getConnection();
    try {
        const { nom, prix, description, id_categorie, oldImage } = req.body;
        const image = req.file ? req.file.filename : oldImage;
        await connection.execute(
            'UPDATE produits SET nom=?, prix=?, description=?, image=?, id_categorie=? WHERE id=?',
            [nom, prix, description, image, id_categorie, req.params.id]
        );
        res.redirect('/admin?tab=products');
    } catch (err) {
        console.error('Erreur POST /admin/modifier-produit :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /admin/commandes/:id — détail + formulaire statut
router.get('/commandes/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).render('errors/404', { title: 'Page introuvable' });
        const commande = { ...rows[0], articlesList: JSON.parse(rows[0].articles) };
        res.render('admin/commande-detail', { title: `Commande #${commande.id}`, commande });
    } catch (err) {
        console.error('Erreur GET /admin/commandes/:id :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// POST /admin/commandes/:id/statut — mise à jour statut
router.post('/commandes/:id/statut', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { statut } = req.body;
        const VALID = ['En attente', 'Expédiée', 'Livrée'];
        if (!VALID.includes(statut)) return res.redirect('/admin');
        await connection.execute('UPDATE commandes SET statut = ? WHERE id = ?', [statut, req.params.id]);
        res.redirect('/admin/commandes/' + req.params.id);
    } catch (err) {
        console.error('Erreur POST /admin/commandes statut :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// GET /admin/export-commandes — AJOUT ÉTAPE 7
router.get('/export-commandes', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [commandes] = await connection.execute(
            'SELECT id, nom, email, telephone, ville, total, paiement, statut, date_creation FROM commandes ORDER BY date_creation DESC'
        );
        const headers = ['ID', 'Nom', 'Email', 'Telephone', 'Ville', 'Total FCFA', 'Paiement', 'Statut', 'Date'];
        const rows = commandes.map(c => [
            c.id,
            c.nom,
            c.email || '',
            c.telephone,
            c.ville,
            c.total,
            c.paiement,
            c.statut || 'En attente',
            new Date(c.date_creation).toLocaleDateString('fr-FR')
        ]);
        const BOM = '\uFEFF';
        const csv = BOM + [headers, ...rows].map(row => row.join(';')).join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="commandes_sirani_${Date.now()}.csv"`);
        res.send(csv);
    } catch (err) {
        console.error('Erreur GET /admin/export-commandes :', err);
        res.status(500).render('errors/500', { title: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

module.exports = router;
