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
exports.deletePred = exports.updatePred = exports.createPred = exports.fetchOnePred = exports.fetchAllPred = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const randomstring_1 = __importDefault(require("randomstring"));
const fetchAllPred = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const predicateur = yield (0, method_1.fetchTableData)("predicateur", "ORDER by idPred DESC");
        if (!(predicateur === null || predicateur === void 0 ? void 0 : predicateur.length))
            return res.status(200).json([]);
        const allPredicateur = predicateur.map((items) => ({
            id: items.idPred,
            titre: items.titre,
            nom: items.nom,
            prenom: items.prenom,
            tel: items.tel,
            eglise: items.eglise,
            tkPred: items.tkPred,
        }));
        return res.status(200).json(allPredicateur);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchAllPred = fetchAllPred;
const fetchOnePred = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const preds = yield (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [id]);
        if (preds === null || preds === void 0 ? void 0 : preds.length) {
            const currentPreds = preds[0];
            let data = {
                id: currentPreds.idPred,
                titre: currentPreds.titre,
                nom: currentPreds.nom,
                prenom: currentPreds.prenom,
                eglise: currentPreds.eglise,
                tel: currentPreds.tel,
                tkPred: currentPreds.tkPred,
            };
            return res.status(200).json(data);
        }
        return res.status(404).json({ message: "Predicateur non trouvé " });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchOnePred = fetchOnePred;
const createPred = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nom, prenom, eglise, titre, tel } = req.body, token = randomstring_1.default.generate(6), error = (0, method_1.checkError)(req.body, {
        nom: joi_1.default.string().required().messages({ "any.required": "Le nom est requis." }),
        prenom: joi_1.default.string().required().messages({ "any.required": "Le prenom est requis." }),
        tel: joi_1.default.string()
            .pattern(/^(?:\+\d{1,3})?\d{9,10}$/)
            .allow("")
            .messages({
            "string.pattern.base": "Le numéro de téléphone doit contenir 10 chiffres ou commencer par un indicatif de pays suivi de 10 chiffres.",
            "any.required": "Le numéro de téléphone est requis.",
        }),
        eglise: joi_1.default.string().required(),
        titre: joi_1.default.string().allow(""),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json(error);
    try {
        if (!(yield (0, method_1.isFindColumn)("predicateur", ["nom", "prenom", "eglise"], [nom, prenom, eglise]))) {
            const pred = yield (0, method_1.createData)("predicateur", ["titre", "nom", "prenom", "eglise", "tkPred", "tel"], ["?", "?", "?", "?", "?", "?"], [titre, nom, prenom, eglise, token, tel]);
            if (pred) {
                return res.status(200).json({ message: "Enregistrement effectué" });
            }
        }
        else
            return res.status(400).json({ message: "Ce Predicateur est déjà enregistré" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.createPred = createPred;
const updatePred = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, { nom, prenom, eglise, titre, tel } = req.body, error = (0, method_1.checkError)(req.body, {
        id: joi_1.default.number(),
        nom: joi_1.default.string(),
        prenom: joi_1.default.string(),
        eglise: joi_1.default.string(),
        titre: joi_1.default.string(),
        tkPred: joi_1.default.string(),
        tel: joi_1.default.allow(""),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const pred = yield (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [id]);
        let error = false;
        if (pred.length) {
            if (pred[0].titre != titre) {
                const updateTitre = yield (0, method_1.updateData)("predicateur", ["titre"], ["tkPred"], [titre, id]);
                if (!updateTitre)
                    error = true;
            }
            if (pred[0].nom != nom) {
                const updateNom = yield (0, method_1.updateData)("predicateur", ["nom"], ["tkPred"], [nom, id]);
                if (!updateNom)
                    error = true;
            }
            if (pred[0].prenom != prenom) {
                const updatePrenom = yield (0, method_1.updateData)("predicateur", ["prenom"], ["tkPred"], [prenom, id]);
                if (!updatePrenom)
                    error = true;
            }
            if (pred[0].eglise != eglise) {
                const updateEglise = yield (0, method_1.updateData)("predicateur", ["eglise"], ["tkPred"], [eglise, id]);
                if (!updateEglise)
                    error = true;
            }
            if (pred[0].tel != tel) {
                const updateTel = yield (0, method_1.updateData)("predicateur", ["tel"], ["tkPred"], [tel, id]);
                if (!updateTel)
                    error = true;
            }
            if (error)
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" });
            else
                return res.status(200).json({ message: "Modification réussi" });
        }
        else
            return res.status(400).json({ message: "Ce predicateur n'existe pas" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.updatePred = updatePred;
const deletePred = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.string().required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    if (yield (0, method_1.isFindColumn)("predicateur", ["tkPred"], [id])) {
        if (yield (0, method_1.deleteData)("predicateur", ["tkPred"], [id])) {
            return res.status(200).json({ message: "Supression reussi" });
        }
    }
    else {
        return res.status(400).json({ message: "Ce predicateur n'existe pas" });
    }
});
exports.deletePred = deletePred;
