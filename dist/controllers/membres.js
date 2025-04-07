"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActiveMembre = exports.activeMembre = exports.checkOneMembre = exports.checkMembre = exports.celibataireMembre = exports.parentMembre = exports.deleteMembre = exports.updateProfilMembre = exports.updateMembre = exports.createMembre = exports.fetchOneMembre = exports.fetchAllMembre = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const multerConfig_1 = require("../middleware/multerConfig");
const randomstring_1 = __importDefault(require("randomstring"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
moment_1.default.locale("fr");
const fetchAllMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const membres = yield (0, method_1.fetchTableData)("v_membre_all", "ORDER by idMembre");
        if (membres) {
            let allMembre = [];
            membres.map((items) => {
                let data = {
                    idMembre: items.idMembre,
                    nom: items.nom,
                    prenom: items.prenom,
                    postnom: items.postnom,
                    telephone: items.telephone,
                    dateNaissance: (0, moment_1.default)(items.dateNaissance).format("LL"),
                    email: items.email,
                    sexe: items.sexe,
                    avenue: items.avenue,
                    quartier: items.quartier,
                    commune: items.commune,
                    reference: items.reference,
                    fonction: items.fonction,
                    pere: items.nomPere && `${items.nomPere}  ${items.prenomPere}`,
                    mere: items.nomMere && `${items.nomMere}  ${items.prenomMere}`,
                    conjoint: items.nomConjoint && `${items.nomConjoint} ${items.prenomConjoint}`,
                    batise: items.isBaptise ? "Oui" : "Non",
                    egliseBaptise: items.egliseBaptise,
                    decede: items.idDecede,
                    dateDecede: items.dateDecede,
                    profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                    tkMembre: items.tkMembre,
                };
                allMembre.push(data);
            });
            return res.status(200).json(allMembre);
        }
        else
            res.status(200).json("Pas de membres");
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchAllMembre = fetchAllMembre;
const fetchOneMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const membres = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [id]);
        membres.map((items) => {
            const data = {
                idMembre: items.idMembre,
                nom: items.nom,
                prenom: items.prenom,
                postnom: items.postnom,
                telephone: items.telephone,
                dateNaissance: (0, moment_1.default)(items.dateNaissance).format("YYYY-MM-DD"),
                email: items.email,
                sexe: items.sexe,
                avenue: items.avenue,
                quartier: items.quartier,
                commune: items.commune,
                fonction: items.fkFonction,
                pere: items.fkPere,
                mere: items.fkMere,
                conjoint: items.fkConjoint,
                baptise: items.isBaptise,
                egliseBaptise: items.egliseBaptise,
                decede: items.idDecede,
                dateDecede: items.dateDecede,
                profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                tkMembre: items.tkMembre,
            };
            return res.status(200).json(data);
        });
    }
    catch (error) {
        return res.status(404).json(error);
    }
});
exports.fetchOneMembre = fetchOneMembre;
const createMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nom, prenom, postnom, telephone, dateNaissance, email, sexe, avenue, quartier, commune, reference, fonction, mere, pere, conjoint, baptise, egliseBaptise, marie, } = req.body, { profil } = req.files, file = profil ? profil[0].filename : null, extension = file ? path_1.default.extname(file) : null, token = randomstring_1.default.generate(6), error = (0, method_1.checkError)(req.body, {
        nom: joi_1.default.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
        prenom: joi_1.default.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
        postnom: joi_1.default.string().allow(""),
        dateNaissance: joi_1.default.date(),
        email: joi_1.default.string().email().message("Inserer un bon mail").allow(""),
        telephone: joi_1.default.string()
            .pattern(/^(?:\+\d{1,3})?\d{9,10}$/)
            .allow("")
            .messages({
            "string.pattern.base": "Le numéro de téléphone doit contenir 10 chiffres ou commencer par un indicatif de pays suivi de 10 chiffres.",
            "any.required": "Le numéro de téléphone est requis.",
        }),
        sexe: joi_1.default.string().max(1).message("Un seul caractere"),
        avenue: joi_1.default.string(),
        quartier: joi_1.default.string(),
        commune: joi_1.default.string(),
        reference: joi_1.default.string(),
        fonction: joi_1.default.allow(""),
        baptise: joi_1.default.string(),
        egliseBaptise: joi_1.default.string().allow(""),
        mere: joi_1.default.allow(""),
        pere: joi_1.default.allow(""),
        conjoint: joi_1.default.allow(""),
        marie: joi_1.default.allow(""),
        profil: joi_1.default.string(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    fonction = fonction == "undefined" ? null : fonction;
    mere = mere == "undefined" ? null : mere;
    pere = pere == "undefined" ? null : pere;
    conjoint = conjoint == "undefined" ? null : conjoint;
    marie = marie == "undefined" ? null : marie;
    baptise = baptise == "true" ? true : false;
    /* console.log(req.body) */
    try {
        if (!(yield (0, method_1.isFindColumn)("membre", ["nom", "prenom", "postnom", "dateNaissance"], [nom, prenom, postnom, dateNaissance]))) {
            if (file)
                (0, multerConfig_1.fileCompresse)(extension, profil[0]);
            const membre = yield (0, method_1.createData)("membre", [
                "nom",
                "prenom",
                "postnom",
                "telephone",
                "dateNaissance",
                "email",
                "sexe",
                "avenue",
                "quartier",
                "commune",
                "reference",
                "fkfonction",
                "fkmere",
                "fkpere",
                "fkconjoint",
                "isBaptise",
                "egliseBaptise",
                "tkMembre",
                "profil",
            ], ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"], [
                nom,
                prenom,
                postnom,
                telephone,
                dateNaissance,
                email,
                sexe,
                avenue,
                quartier,
                commune,
                reference,
                fonction,
                mere,
                pere,
                conjoint,
                baptise,
                egliseBaptise,
                token,
                file,
            ]);
            if (membre) {
                if (conjoint) {
                    //mettre à jour la colone marier chez un l'autre membre choisie dans le formulaire
                    const lastInsertId = membre === null || membre === void 0 ? void 0 : membre.insertId;
                    const updateMembreMarie = (0, method_1.updateData)("membre", ["fkConjoint"], ["idMembre"], [lastInsertId, conjoint]);
                }
                res.status(200).json({ message: "Enregistrement effectué" });
            }
            else
                res.status(400).json({
                    success: 0,
                    message: "Erreur survenu lors de l'enregistrement",
                });
            return;
        }
        else
            res.status(400).json({ message: "Ce Membre existe déjà" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.createMembre = createMembre;
const updateMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let { nom, prenom, postnom, telephone, dateNaissance, email, sexe, avenue, quartier, commune, fonction, mere, pere, conjoint, baptise, idMembre, } = req.body;
    const error = (0, method_1.checkError)({
        nom,
        prenom,
        postnom,
        telephone,
        dateNaissance,
        email,
        sexe,
        avenue,
        quartier,
        commune,
        fonction,
        mere,
        pere,
        conjoint,
        baptise,
        idMembre,
    }, {
        nom: joi_1.default.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
        prenom: joi_1.default.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
        postnom: joi_1.default.string().allow(""),
        dateNaissance: joi_1.default.date(),
        email: joi_1.default.string().email().message("Inserer un bon mail").allow(""),
        telephone: joi_1.default.number(),
        sexe: joi_1.default.string().max(1).message("Un seul caractere"),
        avenue: joi_1.default.string(),
        quartier: joi_1.default.string(),
        commune: joi_1.default.string(),
        fonction: joi_1.default.allow(""),
        baptise: joi_1.default.number(),
        mere: joi_1.default.allow(""),
        pere: joi_1.default.allow(""),
        conjoint: joi_1.default.allow(""),
        profil: joi_1.default.string(),
        idMembre: joi_1.default.number(),
    });
    if (error === null || error === void 0 ? void 0 : error.length) {
        console.log(error);
        return res.status(400).json({ error });
    }
    fonction = fonction == "undefined" ? null : fonction;
    mere = mere == "undefined" ? null : mere;
    pere = pere == "undefined" ? null : pere;
    conjoint = conjoint == "undefined" ? null : conjoint;
    baptise = baptise == "true" ? true : false;
    try {
        const membre = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [id]);
        let error = false;
        if (membre.length) {
            if (membre[0].nom != nom) {
                const updateNom = yield (0, method_1.updateData)("membre", ["nom"], ["tkMembre"], [nom, id]);
                if (!updateNom)
                    error = true;
            }
            if (membre[0].prenom != prenom) {
                const updatePrenom = yield (0, method_1.updateData)("membre", ["prenom"], ["tkMembre"], [prenom, id]);
                if (!updatePrenom)
                    error = true;
            }
            if (membre[0].postnom != postnom) {
                const updatePostnom = yield (0, method_1.updateData)("membre", ["postnom"], ["tkMembre"], [postnom, id]);
                if (!updatePostnom)
                    error = true;
            }
            if (membre[0].telephone != telephone) {
                const updateTel = yield (0, method_1.updateData)("membre", ["telephone"], ["tkMembre"], [telephone, id]);
                if (!updateTel)
                    error = true;
            }
            if (membre[0].dateNaissance != dateNaissance) {
                const updateDateNaissance = yield (0, method_1.updateData)("membre", ["dateNaissance"], ["tkMembre"], [dateNaissance, id]);
                if (!updateDateNaissance)
                    error = true;
            }
            if (membre[0].email != email) {
                const updateEmail = yield (0, method_1.updateData)("membre", ["email"], ["tkMembre"], [email, id]);
                if (!updateEmail)
                    error = true;
            }
            if (membre[0].sexe != sexe) {
                const updateSexe = yield (0, method_1.updateData)("membre", ["sexe"], ["tkMembre"], [sexe, id]);
                if (!updateSexe)
                    error = true;
            }
            if (membre[0].avenue != avenue) {
                const updateAvenue = yield (0, method_1.updateData)("membre", ["avenue"], ["tkMembre"], [avenue, id]);
                if (!updateAvenue)
                    error = true;
            }
            if (membre[0].quartier != quartier) {
                const updateQuartier = yield (0, method_1.updateData)("membre", ["quartier"], ["tkMembre"], [quartier, id]);
                if (!updateQuartier)
                    error = true;
            }
            if (membre[0].commune != commune) {
                const updateCommune = yield (0, method_1.updateData)("membre", ["commune"], ["tkMembre"], [commune, id]);
                if (!updateCommune)
                    error = true;
            }
            if (membre[0].isBaptise != req.body.baptise) {
                console.log(req.body.baptise);
                const updateBaptise = yield (0, method_1.updateData)("membre", ["isBaptise"], ["tkMembre"], [req.body.baptise, id]);
                if (!updateBaptise)
                    error = true;
            }
            if (membre[0].fkFonction != fonction) {
                const updateFonction = yield (0, method_1.updateData)("membre", ["fkFonction"], ["tkMembre"], [fonction, id]);
                if (!updateFonction)
                    error = true;
            }
            if (membre[0].fkPere != pere) {
                const updatePere = yield (0, method_1.updateData)("membre", ["fkPere"], ["tkMembre"], [pere, id]);
                if (!updatePere)
                    error = true;
            }
            if (membre[0].fkMere != mere) {
                const updateMere = yield (0, method_1.updateData)("membre", ["fkMere"], ["tkMembre"], [mere, id]);
                if (!updateMere)
                    error = true;
            }
            if (membre[0].fkConjoint != conjoint) {
                const value = null;
                //mettre à jour l'ancien partenaire pour qu'il devient zero
                const updateOldConjoint = yield (0, method_1.updateData)("membre", ["fkConjoint"], ["idMembre"], [value, membre[0].fkConjoint]);
                //mettre le conjoint selectionner
                const updateConjoint = yield (0, method_1.updateData)("membre", ["fkConjoint"], ["tkMembre"], [conjoint, id]);
                //mettre à jour la colone marier chez un l'autre membre choisie dans le formulaire
                const updateMembreMarie = yield (0, method_1.updateData)("membre", ["fkConjoint"], ["idMembre"], [idMembre, conjoint]);
                if (!updateConjoint)
                    error = true;
            }
            if (error) {
                /* cancelTransaction() */
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" });
            }
            else {
                /* commitTransaction() */
                return res.status(200).json({ message: "Modification réussi" });
            }
        }
        else
            res.status(400).json({ messsage: "Ce membre n'existe pas " });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.updateMembre = updateMembre;
const updateProfilMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let { profil } = req.files, file = profil ? profil[0].filename : null, extension = file ? path_1.default.extname(file) : null;
    if (file)
        (0, multerConfig_1.fileCompresse)(extension, profil[0]);
    try {
        const membre = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [id]);
        if (membre.length) {
            //supprimer l'image pour laisser seulement le nouveau
            const updateProfilMembre = yield (0, method_1.updateData)("membre", ["profil"], ["tkMembre"], [file, id]);
            if (updateProfilMembre)
                return res.status(200).json({ message: "Modification réussi" });
            if (membre[0].profil) {
                const filePath = path_1.default.join(path_1.default.resolve(__dirname, ".."), "images", membre[0].profil);
                try {
                    fs_1.default.unlinkSync(filePath);
                    console.log("Fichier supprimé avec succès !");
                }
                catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err);
                }
            }
            else
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" });
        }
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.updateProfilMembre = updateProfilMembre;
const deleteMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.string().required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        if (yield (0, method_1.isFindColumn)("membre", ["tkMembre"], [id])) {
            const membres = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [id]);
            const filePath = path_1.default.join(path_1.default.resolve(__dirname, ".."), "images", membres[0].profil);
            console.log(filePath);
            if (membres[0].profil) {
                try {
                    fs_1.default.unlinkSync(filePath);
                    console.log("Fichier supprimé avec succès !");
                }
                catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err);
                }
            }
            if (yield (0, method_1.deleteData)("membre", ["tkMembre"], [id])) {
                return res.status(200).json({ message: "Supression reussi" });
            }
        }
        else {
            return res.status(400).json({ message: "Ce membre n'existe pas" });
        }
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.deleteMembre = deleteMembre;
//recuperer les données par sexe pour remplir le select de Pere(M) et de Mere(M)
const parentMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sexe } = req.params;
    try {
        const parent = yield (0, method_1.fetchTableColumns)("membre", ["sexe"], [sexe]);
        if (parent.length) {
            const allParent = parent.map((items) => ({
                value: items.idMembre,
                label: `${items.nom} ${items.postnom} ${items.prenom}`,
            }));
            allParent.unshift({ value: "undefined", label: "sélectionner..." });
            return res.status(200).json(allParent);
        }
        return res.status(200).json([]);
    }
    catch (error) {
        res.status(400).json({ message: error || "An error occurred" });
    }
});
exports.parentMembre = parentMembre;
//api pour afficher le marie et le celibataire
const celibataireMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sexe } = req.params;
    try {
        const celibataire = yield (0, method_1.fetchTableColumns)("membre", ["sexe"], [sexe], "AND fkConjoint IS NULL");
        if (celibataire.length) {
            const allCelibataire = celibataire.map((items) => ({
                value: items.idMembre,
                label: `${items.nom} ${items.postnom} ${items.prenom}`,
            }));
            allCelibataire.unshift({ value: "undefined", label: "sélectionner..." });
            return res.status(200).json(allCelibataire);
        }
        return res.status(200).json([]);
    }
    catch (error) {
        res.status(400).json({ message: error || "An error occurred" });
    }
});
exports.celibataireMembre = celibataireMembre;
const checkMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nom, prenom, postnom } = req.body;
    const error = (0, method_1.checkError)(req.body, {
        nom: joi_1.default.string().min(3).required().messages({ "any.required": "Entrer le champ nom correctement" }),
        prenom: joi_1.default.string().min(3).required().messages({ "any.required": "Entrer le champ prenom correctement" }),
        postnom: joi_1.default.string().allow(""),
        other: joi_1.default.string().allow(""),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const script = "SELECT * FROM membre WHERE nom=? AND prenom=? AND postnom=?";
        const membresCheck = yield (0, method_1.personalQueryAsync)(script, [nom, prenom, postnom]);
        if (membresCheck.length)
            return res.status(200).json({ message: "Merci ! Vous etês membre", membre: membresCheck[0].tkMembre });
        else
            return res.status(400).json({ message: "Erreur vous êtes pas membre" });
    }
    catch (error) {
        res.status(400).json({ message: error || "An error occurred" });
    }
});
exports.checkMembre = checkMembre;
const checkOneMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tkMembre } = req.params;
    if (tkMembre) {
        const oneMembre = yield (0, method_1.fetchTableColumns)("v_membre_all", ["tkMembre"], [tkMembre]);
        const script = "SELECT nom,prenom,tkMembre FROM membre WHERE fkPere = ?";
        const childrenMembre = yield (0, method_1.personalQueryAsync)(script, [oneMembre[0].idMembre]);
        const items = oneMembre[0];
        const data = {
            idMembre: items.idMembre,
            nom: items.nom,
            prenom: items.prenom,
            postnom: items.postnom && items.postnom,
            telephone: items.telephone,
            dateNaissance: (0, moment_1.default)(items.dateNaissance).format("LL"),
            email: items.email,
            sexe: items.sexe,
            avenue: items.avenue,
            quartier: items.quartier,
            commune: items.commune,
            fonction: items.fonction,
            pere: items.nomPere && `${items.nomPere} ${items.prenomPere}`,
            mere: items.nomMere && `${items.nomMere} ${items.prenomMere}`,
            conjoint: items.nomConjoint && `${items.nomConjoint} ${items.prenomConjoint}`,
            tkConjoint: items.tkConjoint && items.tkConjoint,
            baptise: items.isBaptise ? "Oui" : "Non",
            egliseBaptise: items.egliseBaptise ? items.egliseBaptise : "Assemblée Chretienne de Carrigres",
            reference: items.reference,
            decede: items.idDecede,
            dateDecede: items.dateDecede,
            profil: items.profil && items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
            tkMembre: items.tkMembre,
            childrenMembre,
        };
        return res.status(200).json(data);
    }
});
exports.checkOneMembre = checkOneMembre;
const activeMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeMembre = yield (0, method_1.fetchTableData)("activeMembre");
        if (activeMembre.length)
            return res.status(200).json(activeMembre[0]);
        else
            res.status(400).json({ message: "Pas activer" });
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.activeMembre = activeMembre;
const createActiveMembre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeMembre = yield (0, method_1.fetchTableData)("activeMembre");
        const valueActiveMembre = activeMembre[0].activeMembre;
        const idActive = activeMembre && activeMembre[0].idActive;
        let error = false;
        let message = valueActiveMembre ? "Fermeture de l'enregistrement" : "Ouverture de l'enregistrement ";
        if (valueActiveMembre || !valueActiveMembre) {
            const updateActiveMembre = yield (0, method_1.updateData)("activeMembre", ["activeMembre"], ["idActive"], [!valueActiveMembre, idActive]);
            if (!updateActiveMembre)
                error = true;
        }
        if (error)
            return res.status(400).json({ message: "Erreur lors de l'activation" });
        else
            return res.status(200).json({ message });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.createActiveMembre = createActiveMembre;
