CREATE DATABASE IF NOT EXISTS db_parfumerie CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE db_parfumerie;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categories` (`id`, `nom`) VALUES
(1, 'Femme'),
(2, 'Homme'),
(3, 'Unisex');

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `adresse` text COLLATE utf8mb4_general_ci NOT NULL,
  `ville` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `codepostal` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `articles` text COLLATE utf8mb4_general_ci,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `paiement` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'A la livraison',
  `statut` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'En attente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `commandes` (`id`, `nom`, `telephone`, `adresse`, `ville`, `codepostal`, `total`, `articles`, `date_creation`, `paiement`) VALUES
(9, 'traore koura', '+22390859397', 'kalabanbougou', 'bamako', '545', 15000.00, '[{"id":3,"nom":"Invictus","prix":"10000.00","image":"Invictus.jpeg","qty":1},{"id":14,"nom":"Matelot","prix":"5000.00","image":"1769247468320.jpg","qty":1}]', '2026-01-24 22:10:57', 'A la livraison'),
(8, 'traore koura', '+22390859397', 'kalaban', 'bamako', '123', 21000.00, '[{"id":8,"nom":"Scandal","prix":"21000.00","image":"Scandal.jpeg","qty":1}]', '2026-01-24 11:08:11', 'A la livraison'),
(13, 'traore koura', '+22390859397', 'kalabanbougou', 'bamako', '545', 90000.00, '[{"id":26,"nom":"Libre","prix":"90000.00","image":"Libre.jpg","qty":1}]', '2026-02-02 09:01:22', 'A la livraison'),
(14, 'traore koura', '+22390859397', 'kalabanbougou', 'bamako', '545', 7000.00, '[{"id":32,"nom":"Sorbetto","prix":"7000.00","image":"Sorbetto.jpeg","qty":1}]', '2026-02-02 11:31:06', 'Orange Money');

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `sujet` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_general_ci NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `messages` (`id`, `nom`, `email`, `sujet`, `contenu`, `date_creation`) VALUES
(3, 'traore koura', 'koura@gmail.com', 'kalabanbougou', 'bien reçu ', '2026-02-02 09:02:08');

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `prix` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `id_categorie` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_categorie` (`id_categorie`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `produits` (`id`, `nom`, `description`, `prix`, `image`, `stock`, `id_categorie`) VALUES
(35, 'Scandal', 'Une senteur unique, chic et intemporelle.', 2000.00, 'Scandal.jpeg', 50, 1),
(31, 'Olive', 'Parfum élégant, frais et unisex.', 5000.00, 'Olive.jpeg', 50, 3),
(32, 'Sorbetto', 'Une fragrance douce, raffinée et durable.', 7000.00, 'Sorbetto.jpeg', 49, 1),
(30, 'Bombshell', 'Parfum unisex au charme discret.', 2000.00, 'Bombshell.jpg', 48, 3),
(28, 'Good Girl', 'Un sillage léger mais marquant.', 2000.00, 'Good Girl.jpeg', 50, 1),
(29, 'Samsara', 'Élégance pure en une fragrance.', 6000.00, 'Samsara.jpeg', 50, 1),
(26, 'Libre', 'Une touche de luxe au quotidien.', 90000.00, 'Libre.jpg', 49, 1),
(24, 'Invictus bleu', 'Un parfum chic au caractère unique.', 20000.00, 'Invictus bleu.jpeg', 50, 1),
(25, 'Gkmen', 'Douceur et intensité en harmonie.', 5000.00, 'Gkmen.jpg', 50, 3),
(23, 'touch', 'Une touche de luxe au quotidien', 500.00, 'touch.jpg', 50, 1),
(27, 'Pink Sugar et Kardashian', 'Parfum moderne et intemporel.', 5000.00, 'Pink Sugar et Kardashian.jpeg', 50, 3),
(34, 'Nivea Men', 'Fraîcheur, élégance et intensité réunies.', 2000.00, 'Nivea Men.jpg', 50, 2);
