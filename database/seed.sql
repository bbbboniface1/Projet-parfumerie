-- Sirani Parfumerie - Données initiales
-- À exécuter après schema.sql

USE db_parfumerie;

INSERT IGNORE INTO `categories` (`id`, `nom`) VALUES
(1, 'Femme'),
(2, 'Homme'),
(3, 'Unisex');

INSERT IGNORE INTO `produits` (`id`, `nom`, `description`, `prix`, `image`, `stock`, `id_categorie`) VALUES
(23, 'touch',                    'Une touche de luxe au quotidien',             500.00,   'touch.jpg',                         50, 1),
(24, 'Invictus bleu',            'Un parfum chic au caractère unique.',         20000.00, 'Invictus bleu.jpeg',                50, 1),
(25, 'Gkmen',                    'Douceur et intensité en harmonie.',            5000.00,  'Gkmen.jpg',                         50, 3),
(26, 'Libre',                    'Une touche de luxe au quotidien.',            90000.00, 'Libre.jpg',                         50, 1),
(27, 'Pink Sugar et Kardashian', 'Parfum moderne et intemporel.',                5000.00,  'Pink Sugar et Kardashian.jpeg',     50, 3),
(28, 'Good Girl',                'Un sillage léger mais marquant.',              2000.00,  'Good Girl.jpeg',                    50, 1),
(29, 'Samsara',                  'Élégance pure en une fragrance.',              6000.00,  'Samsara.jpeg',                      50, 1),
(30, 'Bombshell',                'Parfum unisex au charme discret.',             2000.00,  'Bombshell.jpg',                     50, 3),
(31, 'Olive',                    'Parfum élégant, frais et unisex.',             5000.00,  'Olive.jpeg',                        50, 3),
(32, 'Sorbetto',                 'Une fragrance douce, raffinée et durable.',    7000.00,  'Sorbetto.jpeg',                     50, 1),
(34, 'Nivea Men',                'Fraîcheur, élégance et intensité réunies.',    2000.00,  'Nivea Men.jpg',                     50, 2),
(35, 'Scandal',                  'Une senteur unique, chic et intemporelle.',    2000.00,  'Scandal.jpeg',                      50, 1);

INSERT IGNORE INTO `messages` (`id`, `nom`, `email`, `sujet`, `contenu`, `date_creation`) VALUES
(3, 'traore koura', 'koura@gmail.com', 'kalabanbougou', 'bien reçu', '2026-02-02 09:02:08');
