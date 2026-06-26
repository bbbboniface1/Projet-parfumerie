-- ============================================================
-- Sirani Parfumerie — Schéma complet de la base de données
-- MySQL 8 — utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_parfumerie
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_parfumerie;

-- ------------------------------------------------------------
-- Table : categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id   TINYINT     NOT NULL AUTO_INCREMENT,
    nom  VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (id, nom) VALUES
    (1, 'Femme'),
    (2, 'Homme'),
    (3, 'Unisex');

-- ------------------------------------------------------------
-- Table : produits
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produits (
    id           INT            NOT NULL AUTO_INCREMENT,
    nom          VARCHAR(255)   NOT NULL,
    description  TEXT,
    prix         DECIMAL(10,2)  NOT NULL CHECK (prix > 0),
    image        VARCHAR(255)   DEFAULT 'default.jpg',
    stock        INT            NOT NULL DEFAULT 50 CHECK (stock >= 0),
    id_categorie TINYINT        NOT NULL DEFAULT 1
                                COMMENT '1=Femme, 2=Homme, 3=Unisex',
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_categorie (id_categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : commandes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commandes (
    id             INT            NOT NULL AUTO_INCREMENT,
    nom            VARCHAR(255)   NOT NULL,
    email          VARCHAR(255)   DEFAULT NULL
                                  COMMENT 'Optionnel — pour suivi commande',
    telephone      VARCHAR(20)    NOT NULL,
    adresse        TEXT           NOT NULL,
    ville          VARCHAR(100)   NOT NULL,
    codepostal     VARCHAR(10),
    total          DECIMAL(10,2)  NOT NULL,
    articles       JSON           NOT NULL
                                  COMMENT 'Snapshot JSON des articles commandés',
    paiement       VARCHAR(50)    DEFAULT 'A la livraison'
                                  COMMENT 'A la livraison | Orange Money',
    statut         VARCHAR(20)    DEFAULT 'En attente'
                                  COMMENT 'En attente | Expédiée | Livrée',
    date_creation  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id             INT           NOT NULL AUTO_INCREMENT,
    nom            VARCHAR(255)  NOT NULL,
    email          VARCHAR(255)  NOT NULL,
    sujet          VARCHAR(255),
    contenu        TEXT          NOT NULL,
    date_creation  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
