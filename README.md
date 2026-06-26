# 🌸 Sirani Parfumerie — E-commerce

> Projet de fin d'études — Licence Informatique

## 📋 Description

Application web e-commerce de vente de parfums développée avec Node.js, Express 5, EJS et MySQL.
Fonctionnalités : catalogue filtrable, panier session, commandes en ligne, historique commandes client, espace administration sécurisé, export CSV.

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| **Back-end** | Node.js + Express 5 |
| **Template** | EJS |
| **Base de données** | MySQL 8 + mysql2/promise (pool de connexions) |
| **Session** | express-session |
| **Sécurité** | bcrypt, helmet, express-rate-limit, express-validator |
| **Upload** | Multer (images produits, 5 MB max, JPEG/PNG/WebP) |
| **Logs** | pino + pino-http |
| **Email** | Nodemailer (SMTP) |
| **Compression** | compression (gzip) |

## 📁 Structure du projet

```
sirani-parfumerie/
├── db/
│   ├── init.sql          # Données initiales (seed)
│   └── schema.sql        # Schéma complet documenté
├── lib/
│   ├── logger.js         # Logger pino
│   └── mailer.js         # Envoi emails (confirmation + contact)
├── middleware/
│   ├── errorHandler.js   # 404 + 500
│   └── requireAdmin.js   # Protection routes admin
├── public/
│   ├── css/style.css     # Design system Sirani (variables, composants)
│   ├── js/main.js        # Scripts front (navbar, cards, toast...)
│   └── img/              # Images produits (uploadées via admin)
├── routes/
│   ├── admin.js          # Routes /admin (CRUD produits, commandes, export)
│   ├── panier.js         # Routes /panier (ajouter, supprimer)
│   └── public.js         # Routes publiques (/, /produit, /commande, /merci...)
├── views/
│   ├── partials/         # header.ejs, footer.ejs
│   ├── errors/           # 404.ejs, 500.ejs
│   ├── admin/            # commande-detail.ejs
│   └── *.ejs             # index, produit, panier, commande, contact...
├── .env.example          # Variables d'environnement (modèle)
├── .gitignore
├── server.js             # Point d'entrée
└── start.sh              # Démarrage MySQL + Node (Replit)
```

## ⚙️ Installation

```bash
# 1. Cloner le dépôt
git clone <url>
cd sirani-parfumerie

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env : remplir DB_*, SESSION_SECRET, ADMIN_PASSWORD_HASH, SMTP_*

# 4. Importer le schéma MySQL
mysql -u root -p < db/schema.sql

# 5. (Optionnel) Charger les données de démo
mysql -u root -p db_parfumerie < db/init.sql

# 6. Démarrer
node server.js
```

## 🗄️ Schéma de base de données

### `produits`
| Colonne | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT | Clé primaire |
| nom | VARCHAR(255) | Nom du parfum |
| description | TEXT | Description |
| prix | DECIMAL(10,2) | Prix en FCFA |
| image | VARCHAR(255) | Nom du fichier image |
| stock | INT | Quantité en stock |
| id_categorie | TINYINT | 1=Femme, 2=Homme, 3=Unisex |

### `commandes`
| Colonne | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT | Clé primaire |
| nom | VARCHAR(255) | Nom du client |
| email | VARCHAR(255) | Email (optionnel, suivi commande) |
| telephone | VARCHAR(20) | Téléphone |
| adresse | TEXT | Adresse de livraison |
| ville | VARCHAR(100) | Ville |
| total | DECIMAL(10,2) | Montant total |
| articles | JSON | Snapshot des articles |
| paiement | VARCHAR(50) | A la livraison / Orange Money |
| statut | VARCHAR(20) | En attente / Expédiée / Livrée |

### `messages`
| Colonne | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT | Clé primaire |
| nom | VARCHAR(255) | Nom |
| email | VARCHAR(255) | Email |
| sujet | VARCHAR(255) | Sujet |
| contenu | TEXT | Contenu du message |

## 🔐 Sécurité

- Mots de passe hashés **bcrypt** (salt rounds = 10)
- Variables sensibles dans **`.env`** (jamais committées)
- Protection brute force : **5 tentatives / 15 min** (express-rate-limit)
- Headers HTTP sécurisés (**Helmet.js**)
- Validation des formulaires (**express-validator**)
- **Transactions MySQL** : intégrité du stock garantie (rollback si insuffisant)
- Upload sécurisé : filtre MIME réel + limite 5 MB (Multer)

## 🌐 Variables d'environnement

```env
DB_SOCKET=/tmp/mysql.sock   # Socket MySQL (Replit)
SESSION_SECRET=             # Chaîne aléatoire 64 chars
ADMIN_PASSWORD_HASH=        # Hash bcrypt du mot de passe admin
PORT=5000
NODE_ENV=development

# Email (optionnel — dégradation gracieuse si absent)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=                # Email reçoit les notifications contact
```

## 👩‍💻 Auteur

Traore Koura — Licence Informatique — Bamako, Mali — 2026
