CREATE DATABASE IF NOT EXISTS carrigresWebsite CHARACTER SET 'utf8';

USE carrigresWebsite ;

--TABLES

--fonction

CREATE TABLE IF NOT EXISTS fonction(
    IdFonction INT PRIMARY KEY AUTO_INCREMENT,
    fonction VARCHAR(80)
)ENGINE = InnoDB CHARACTER SET utf8mb4;

INSERT INTO fonction(fontion) values ('Pasteur','Pasteur Associer','Diacre')
--end fonction (Pasteur, Pasteur Associer, Predicateur, Administrateur, Diacre, Tresorier, Moniteur(trice),Directeur des chants)

--membre
CREATE TABLE IF NOT EXISTS membre(
    idMembre INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    postnom VARCHAR(50),
    telephone VARCHAR(15),
    dateNaissance DATE,
    email VARCHAR(50),
    sexe CHAR(1),
    avenue VARCHAR(50),
    quartier VARCHAR(50),
    commune VARCHAR(50),
    fkFonction INT,
    fkPere INT,
    fkMere INT,
    fkConjoint INT,
    isBatise BOOLEAN,
    isDecede BOOLEAN,
    dateDecede DATE,
    tkMembre VARCHAR(15),
    profil TEXT,
    CONSTRAINT fkFonctionMembre FOREIGN KEY (fkFonction) REFERENCES fonction(IdFonction),
    CONSTRAINT fkPereMembre FOREIGN KEY (fkPere) REFERENCES membre(idMembre),
    CONSTRAINT fkMereMembre FOREIGN KEY (fkMere) REFERENCES membre(idMembre),
    CONSTRAINT fkConjointMembre FOREIGN KEY (fkConjoint) REFERENCES membre(idMembre)
)ENGINE = InnoDB CHARACTER SET utf8mb4;
--end membre


CREATE TABLE IF NOT EXISTS role(
    idRole INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50)
)ENGINE = InnoDB CHARACTER SET utf8mb4;

INSERT INTO role(role) VALUES('Media');
INSERT INTO role(role) VALUES('Administrateur');

CREATE TABLE IF NOT EXISTS users(
    idUsers INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50),
    mdp TEXT,
    fkMembre INT,
    fkRole INT,
    CONSTRAINT fkUSersMembre FOREIGN KEY (fkMembre) REFERENCES membre(idMembre),
    CONSTRAINT fkUserRole FOREIGN KEY (fkRole) REFERENCES role(idRole)
)ENGINE = InnoDB CHARACTER SET utf8mb4;

--sermon
CREATE TABLE IF NOT EXISTS sermon(
    idSermon INT AUTO_INCREMENT PRIMARY KEY,
    theme TEXT,
    passage VARCHAR(80),
    dateSermon Date,
    lienFacebook TEXT,
    lienYoutube TEXT,
    lienAudio TEXT,
    nbrVue INT,
    fkPredicateur TEXT,
    tkSermon VARCHAR(15)
)ENGINE = InnoDB CHARACTER SET utf8mb4;
--end sermon
--predicateur
CREATE TABLE IF NOT EXISTS predicateur(
    idPred INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(15), /*Frère,Evangéliste  , Pasteur, Docteur, Prophète, Apôtre */
    nomComplet VARCHAR(100),
    eglise VARCHAR(100),
    tel VARCHAR(50),
    tkPred VARCHAR(15)
)ENGINE = InnoDB CHARACTER SET utf8mb4;
--end predicateur