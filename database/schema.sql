-- Sirani Parfumerie - Schéma de la base de données
-- À exécuter UNE FOIS pour créer la structure

CREATE DATABASE IF NOT EXISTS db_parfumerie
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE db_parfumerie;

CREATE TABLE IF NOT EXISTS `categories` (
    `id`  INT          NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(50)  NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `produits` (
    `id`           INT            NOT NULL AUTO_INCREMENT,
    `nom`          VARCHAR(100)   NOT NULL,
    `description`  TEXT,
    `prix`         DECIMAL(10,2)  NOT NULL,
    `image`        VARCHAR(255)   DEFAULT NULL,
    `stock`        INT            DEFAULT 0,
    `id_categorie` INT            DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_categorie` (`id_categorie`),
    CONSTRAINT `fk_categorie` FOREIGN KEY (`id_categorie`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `commandes` (
    `id`            INT            NOT NULL AUTO_INCREMENT,
    `nom`           VARCHAR(100)   NOT NULL,
    `telephone`     VARCHAR(20)    NOT NULL,
    `adresse`       TEXT           NOT NULL,
    `ville`         VARCHAR(100)   NOT NULL,
    `codepostal`    VARCHAR(10)    NOT NULL,
    `total`         DECIMAL(10,2)  NOT NULL,
    `articles`      TEXT,
    `paiement`      VARCHAR(50)    DEFAULT 'A la livraison',
    `date_creation` DATETIME       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `messages` (
    `id`            INT          NOT NULL AUTO_INCREMENT,
    `nom`           VARCHAR(100) NOT NULL,
    `email`         VARCHAR(100) NOT NULL,
    `sujet`         VARCHAR(150) NOT NULL,
    `contenu`       TEXT         NOT NULL,
    `date_creation` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ajout colonne statut (si nécessaire sur une DB existante)
-- ALTER TABLE commandes ADD COLUMN statut VARCHAR(20) DEFAULT 'En attente';
