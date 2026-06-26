/**
 * Génère un hash bcrypt pour le mot de passe admin.
 * Usage : node scripts/generate-hash.js <mot_de_passe>
 * Copiez le hash généré dans ADMIN_PASSWORD_HASH dans .env ou les secrets Replit.
 */
const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
    console.error('Usage : node scripts/generate-hash.js <mot_de_passe>');
    process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
    console.log('\nHash bcrypt généré :');
    console.log(hash);
    console.log('\nAjoutez cette ligne dans .env ou les secrets Replit :');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});
