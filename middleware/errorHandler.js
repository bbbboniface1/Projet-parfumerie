function notFound(req, res) {
    res.status(404).render('errors/404', { title: 'Page introuvable' });
}

function serverError(err, req, res, next) {
    console.error('Erreur serveur :', err.stack || err);
    res.status(500).render('errors/500', { title: 'Erreur serveur' });
}

module.exports = { notFound, serverError };
