CREATE DATABASE IF NOT EXISTS carrigresWebsite CHARACTER SET 'utf8';

/* USE carrigresWebsite ; */
USE c2503752c_carrigresWebsite;

/* --TABLES */

/* --fonction */

CREATE TABLE IF NOT EXISTS fonction(
    IdFonction INT PRIMARY KEY AUTO_INCREMENT,
    fonction VARCHAR(80)
)ENGINE = InnoDB CHARACTER SET utf8mb4;

INSERT INTO fonction(fonction) VALUES ('Pasteur'),('Pasteur Associer'), ('Predicateur'), ('Administrateur'), ('Diacre'), ('Tresorier'),('Moniteur(trice) Ecodim'),('Directeur des chants');
/* --end fonction (Pasteur, Pasteur Associer, Predicateur, Administrateur, Diacre, Tresorier, Moniteur(trice),Directeur des chants)
-- les fonctions c'est pour differentier chaque personne et ensuite classer les predicateurs
--membre */
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
    reference TEXT,
    fkFonction INT,
    fkPere INT,
    fkMere INT,
    fkConjoint INT,
    isBaptise BOOLEAN,
    egliseBaptise VARCHAR(50)
    isDecede BOOLEAN,
    dateDecede DATE,
    tkMembre VARCHAR(15),
    profil TEXT,
    CONSTRAINT fkFonctionMembre FOREIGN KEY (fkFonction) REFERENCES fonction(IdFonction) ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT fkPereMembre FOREIGN KEY (fkPere) REFERENCES membre(idMembre) ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT fkMereMembre FOREIGN KEY (fkMere) REFERENCES membre(idMembre) ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT fkConjointMembre FOREIGN KEY (fkConjoint) REFERENCES membre(idMembre) ON DELETE SET NULL ON UPDATE SET NULL
)ENGINE = InnoDB CHARACTER SET utf8mb4;
/* --end membre */

/* -table role : role est utilisé pour identifier les utilisateurs qui vont se connecter à l'administration et ajouter les informations */
CREATE TABLE IF NOT EXISTS role(
    idRole INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50),
    description_role TEXT
)ENGINE = InnoDB CHARACTER SET utf8mb4;

INSERT INTO role(role,description_role) VALUES
('Admin SiteWeb', 'Administrateur principal : il peut tout faire'), 
('Media', 'Pour les membres qui sont aux medias : il peut  tout faire mais pas créer des membres.'),
('Administrateur','il peut voir : les membres, les prédicateurs et les predications mais il ne peux pas modifier');

/* --table user : utilisé pour créer l'adrministrateuer et s'il faut créer de compte pour les membres de l'église */
CREATE TABLE IF NOT EXISTS users(
    idUsers INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50),
    mdp TEXT,
    fkMembre INT,
    fkRole INT,
    isActive BOOLEAN default 1,
    CONSTRAINT fkUSersMembre FOREIGN KEY (fkMembre) REFERENCES membre(idMembre) ON DELETE SET NULL, 
    CONSTRAINT fkUserRole FOREIGN KEY (fkRole) REFERENCES role(idRole) ON UPDATE CASCADE
)ENGINE = InnoDB CHARACTER SET utf8mb4;

INSERT INTO users(login,mdp,fkrole) VALUES ('Ben','A12345678',1);
/* --sermon */
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
/* --end sermon */
/* --predicateur : table de predicateur etranger */
CREATE TABLE IF NOT EXISTS predicateur(
    idPred INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(15), /*Frère,Evangéliste  , Pasteur, Docteur, Prophète, Apôtre */
    nom VARCHAR(50),
    prenom VARCHAR(50),
    eglise VARCHAR(100),
    tel VARCHAR(50),
    tkPred VARCHAR(15)
)ENGINE = InnoDB CHARACTER SET utf8mb4;
/* end predicateur */

/*View*/
CREATE OR REPLACE VIEW v_membre_user AS SELECT idUsers,nom, prenom, postnom,idRole, role, login,profil,isActive,mdp FROM users 
LEFT JOIN membre ON fkMembre = idMembre
INNER JOIN role on fkRole = idRole;

CREATE OR REPLACE VIEW v_membre_all AS SELECT m.idMembre,m.nom,m.prenom,m.postnom,m.telephone,m.dateNaissance,m.email,m.sexe,m.avenue,
m.quartier,m.commune,m.reference,f.fonction,pere.nom nomPere,pere.prenom prenomPere,mere.nom nomMere,mere.prenom prenomMere,c.nom nomConjoint,c.prenom prenomConjoint,m.isBaptise,m.egliseBaptise,m.dateDecede,m.profil,m.tkMembre 
FROM membre m LEFT JOIN fonction f ON m.fkFonction = f.idFonction
LEFT JOIN membre pere ON m.fkPere = pere.idMembre
LEFT JOIN membre mere ON m.fkMere = mere.idMembre
LEFT JOIN membre c ON m.fkMere = c.idMembre;

/*View*/
