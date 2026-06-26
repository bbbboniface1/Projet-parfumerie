require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const publicRouter = require('./routes/public');
const panierRouter = require('./routes/panier');
const adminRouter = require('./routes/admin');
const requireAdmin = require('./middleware/requireAdmin');
const { notFound, serverError } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 6000000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware global : panier + toast flash + cache
app.use((req, res, next) => {
    let cartCount = 0;
    if (req.session.cart) {
        cartCount = req.session.cart.reduce((t, i) => t + i.qty, 0);
    }
    res.locals.cartCount = cartCount;
    res.locals.toast = req.session.toast || null;
    if (req.session.toast) delete req.session.toast;
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Routes publiques
app.use('/', publicRouter);
app.use('/panier', panierRouter);

// Auth
app.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion', error: req.query.error === '1' });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de tentatives. Réessayez dans 15 minutes.',
    standardHeaders: true, legacyHeaders: false
});

app.post('/admin/login', loginLimiter, async (req, res) => {
    const { password } = req.body;
    try {
        const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (match) { req.session.isAdmin = true; res.redirect('/admin'); }
        else res.redirect('/login?error=1');
    } catch { res.redirect('/login?error=1'); }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error('Erreur destroy session :', err);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Routes admin protégées
app.use('/admin', requireAdmin, adminRouter);

// Erreurs
app.use(notFound);
app.use(serverError);

app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur lance sur le port ${port}`);
});
