require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_parfumerie',
    socketPath: process.env.DB_SOCKET || undefined
};

const storage = multer.diskStorage({
    destination: './public/img',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = uniqueSuffix + path.extname(file.originalname);
        cb(null, cleanName);
    }
});
const upload = multer({ storage: storage });

app.use((req, res, next) => {
    let cartCount = 0;
    if (req.session.cart) {
        cartCount = req.session.cart.reduce((total, item) => total + item.qty, 0);
    }
    res.locals.cartCount = cartCount;
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/', async (req, res) => {
    try {
        const search = req.query.q || '';
        const connection = await mysql.createConnection(dbConfig);
        let sql = 'SELECT * FROM produits';
        let params = [];
        if (search) {
            sql += ' WHERE nom LIKE ? ORDER BY nom ASC';
            params = [`%${search}%`];
        } else {
            sql += ' ORDER BY nom ASC';
        }
        const [produits] = await connection.execute(sql, params);
        res.render('index', { title: 'Sirani Parfumerie', produits: produits, searchTerm: search });
        await connection.end();
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.send("Erreur base de données.");
    }
});

app.get('/produit/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        const [autresProduits] = await connection.execute('SELECT * FROM produits LIMIT 4');
        if (produits.length > 0) {
            res.render('produit', { title: 'Détail - Sirani Parfumerie', produit: produits[0], autres: autresProduits });
        } else {
            res.send("Produit non trouvé");
        }
        await connection.end();
    } catch (err) {
        console.error(err);
        res.send("Erreur serveur");
    }
});

app.post('/panier/ajouter/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        const produit = produits[0];
        if (!req.session.cart) { req.session.cart = []; }
        let existingProduct = req.session.cart.find(p => p.id === produit.id);
        if (existingProduct) {
            existingProduct.qty++;
        } else {
            req.session.cart.push({ id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, qty: 1 });
        }
        await connection.end();
        res.redirect('/panier');
    } catch (err) {
        console.error(err);
        res.send("Erreur ajout panier");
    }
});

app.get('/panier', (req, res) => {
    res.render('panier', { title: 'Mon Panier - Sirani Parfumerie', cart: req.session.cart });
});

app.post('/panier/supprimer/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id != req.params.id);
    }
    res.redirect('/panier');
});

app.get('/commande', (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) { return res.redirect('/panier'); }
    const totalAmount = req.session.cart.reduce((total, item) => total + (item.prix * item.qty), 0);
    res.render('commande', { title: 'Commande - Sirani Parfumerie', cart: req.session.cart, totalAmount: totalAmount });
});

app.post('/commande', async (req, res) => {
    try {
        const { nom, telephone, adresse, ville, codepostal, paiement } = req.body;
        const cart = req.session.cart;
        if (!cart || cart.length === 0) { return res.redirect('/panier'); }
        const total = cart.reduce((sum, item) => sum + (item.prix * item.qty), 0);
        const articlesJSON = JSON.stringify(cart);
        const connection = await mysql.createConnection(dbConfig);
        for (const item of cart) {
            await connection.execute('UPDATE produits SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
        }
        await connection.execute(
            'INSERT INTO commandes (nom, telephone, adresse, ville, codepostal, total, articles, paiement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, telephone, adresse, ville, codepostal, total, articlesJSON, paiement || 'A la livraison']
        );
        await connection.end();
        req.session.cart = null;
        res.redirect('/merci');
    } catch (err) {
        console.error(err);
        res.send("Erreur validation commande");
    }
});

app.get('/merci', (req, res) => {
    res.render('merci', { title: 'Merci - Sirani Parfumerie' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion - Sirani Parfumerie' });
});

app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

app.get('/logout', (req, res) => {
    req.session.isAdmin = false;
    res.redirect('/login');
});

app.get('/admin', async (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [commandes] = await connection.execute('SELECT * FROM commandes ORDER BY date_creation DESC');
        const [produits] = await connection.execute('SELECT * FROM produits ORDER BY nom ASC');
        const [messages] = await connection.execute('SELECT * FROM messages ORDER BY date_creation DESC');
        await connection.end();
        const commandesAvecDetails = commandes.map(cmd => ({ ...cmd, articlesList: JSON.parse(cmd.articles) }));
        let activeTab = 'orders';
        if (req.query.tab === 'products') activeTab = 'products';
        if (req.query.tab === 'messages') activeTab = 'messages';
        res.render('admin', {
            title: 'Administration - Sirani Parfumerie',
            commandes: commandesAvecDetails,
            produits: produits,
            messages: messages,
            activeTab: activeTab
        });
    } catch (err) {
        console.error(err);
        res.send("Erreur récupération données.");
    }
});

app.get('/admin/ajouter-produit', (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    res.render('ajouter-produit', { title: 'Ajouter Produit - Admin' });
});

app.post('/admin/ajouter-produit', upload.single('image'), async (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    try {
        const { nom, prix, description, id_categorie } = req.body;
        const image = req.file ? req.file.filename : 'default.jpg';
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO produits (nom, prix, description, image, id_categorie, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prix, description, image, id_categorie, 50]
        );
        await connection.end();
        res.redirect('/admin?tab=products');
    } catch (err) {
        console.error(err);
        res.send("Erreur lors de l'ajout du produit.");
    }
});

app.post('/admin/supprimer-produit/:id', async (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM produits WHERE id = ?', [req.params.id]);
        await connection.end();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.send("Erreur lors de la suppression.");
    }
});

app.get('/admin/modifier-produit/:id', async (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [produits] = await connection.execute('SELECT * FROM produits WHERE id = ?', [req.params.id]);
        await connection.end();
        if (produits.length > 0) {
            res.render('modifier-produit', { title: 'Modifier Produit - Admin', produit: produits[0] });
        } else {
            res.send("Produit non trouvé");
        }
    } catch (err) {
        console.error(err);
        res.send("Erreur serveur");
    }
});

app.post('/admin/modifier-produit/:id', upload.single('image'), async (req, res) => {
    if (!req.session.isAdmin) { return res.redirect('/login'); }
    try {
        const { nom, prix, description, id_categorie, oldImage } = req.body;
        const image = req.file ? req.file.filename : oldImage;
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE produits SET nom=?, prix=?, description=?, image=?, id_categorie=? WHERE id=?',
            [nom, prix, description, image, id_categorie, req.params.id]
        );
        await connection.end();
        res.redirect('/admin?tab=products');
    } catch (err) {
        console.error(err);
        res.send("Erreur lors de la modification.");
    }
});

app.get('/atelier', (req, res) => {
    res.render('atelier', { title: 'Atelier - Sirani Parfumerie' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact - Sirani Parfumerie' });
});

app.post('/contact', async (req, res) => {
    try {
        const { nom, email, sujet, contenu } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO messages (nom, email, sujet, contenu) VALUES (?, ?, ?, ?)',
            [nom, email, sujet, contenu]
        );
        await connection.end();
        res.redirect('/?message=envoyé');
    } catch (err) {
        console.error(err);
        res.send("Erreur lors de l'envoi du message.");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur lance sur le port ${PORT}`);
});
