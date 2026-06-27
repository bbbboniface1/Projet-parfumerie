# Sirani Parfumerie - Guide de demarrage local

## Demarrage rapide
Double-cliquer sur `start.bat`
Ouvrir http://localhost:3000

## Demarrage manuel
1. Demarrer MySQL dans le panneau XAMPP, ou lancer `C:\xampp\mysql_start.bat`
2. npm start
3. Ouvrir http://localhost:3000

## Compte administrateur
- URL   : http://localhost:3000/login
- MDP   : sirani
- Admin : http://localhost:3000/admin

## WhatsApp boutique
- Numero : +223 90 73 28 94
- Commandes via WhatsApp disponibles sur chaque page produit et dans le panier

## Adresse boutique
Yamacoro, vers la station Baraka
A 200 metres du marche - Bamako, Mali

## En cas de probleme
| Erreur | Solution |
|--------|----------|
| ECONNREFUSED 3306 | Demarrer MySQL dans XAMPP |
| Access denied root | Verifier DB_PASSWORD dans .env |
| Unknown database | mysql -u root < database/schema.sql |
| Cannot find module | npm install |
| Port 3000 occupe | Changer PORT=3001 dans .env |
| Images absentes | Verifier public/img/ non vide |
| Admin mot de passe refuse | node scripts/generate-hash.js sirani puis copier dans .env |
