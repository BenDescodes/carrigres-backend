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
exports.deleteUser = exports.updateUser = exports.fetchAllRole = exports.fetchOneUsers = exports.fetchAllUsers = exports.login = exports.signup = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const type_1 = require("../types/type");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { login, mdp, role, membre, confMdp } = req.body;
    const error = (0, method_1.checkError)(req.body, {
        login: joi_1.default.string().required().messages({ "any.only": "Le login  est obligatoire" }),
        mdp: joi_1.default.string().required().messages({
            "string.empty": "Le mot de passe est obligatoire.",
        }),
        confMdp: joi_1.default.string().required().valid(joi_1.default.ref("mdp")).messages({
            "any.only": "Les deux mots de passe sont incohérents.",
            "string.empty": "La confirmation du mot de passe est obligatoire.",
        }),
        membre: joi_1.default.number().required().messages({ "string.empty": "Selectionner membre" }),
        role: joi_1.default.number().required().messages({ "string.empty": "Selectionner un role" }),
    });
    if (error)
        return res.status(400).json({ message: (_a = error[0]) === null || _a === void 0 ? void 0 : _a.message });
    try {
        const findUser = (0, method_1.isFindColumn)("users", ["login", "fkMembre"], [login, membre]);
        if (!findUser)
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }
    catch (error) {
        return res.status(400).json({ message: `Erreur ${error.message}` });
    }
    (0, bcrypt_1.hash)(mdp, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            return res.status(400).json({ message: "erreur survenu lors du cryptage, veuillez reessayer plutard" });
        try {
            const createUser = yield (0, method_1.createData)("users", ["login", "mdp", "fkROle", "fkMembre"], ["?,?,?,?"], [login, hash, role, membre]);
            if (createUser)
                res.status(200).json({ message: "Enregistrement effectuer" });
            else
                res.status(400).json({ message: "Erreur survenu lors de l'enregistrement" });
        }
        catch (error) {
            return res.status(400).json({ message: `Erreur ${error}` });
        }
        return;
    }));
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { login, mdp } = req.body, error = (0, method_1.checkError)(req.body, {
        login: joi_1.default.string().required(),
        mdp: joi_1.default.string().required(),
    });
    if (error)
        return res.status(400).json({ message: (_b = error[0]) === null || _b === void 0 ? void 0 : _b.message });
    const user = yield (0, method_1.fetchTableColumns)("v_membre_user", ["login"], [login]);
    if (!user[0])
        return res.status(403).json({ code: 13, message: method_1.ErrorMessage.erreurMdp });
    (0, bcrypt_1.compare)(mdp, (_c = user[0]) === null || _c === void 0 ? void 0 : _c.mdp, (err, response) => {
        if (err)
            return res.status(400).json({ error: 403, message: method_1.ErrorMessage.erreurInscription });
        if (!response)
            return res.status(403).json({ code: 403, message: method_1.ErrorMessage.erreurMdp });
        const data = user[0];
        res.status(200).json({
            userData: {
                idUser: data.idUsers,
                login: data.login,
                profil: data.profil ? `${req.protocol}://${req.get("host")}/src/images/${data.profil}` : null,
                /* nomComplet: data.nomComplet, */
                idRole: data.idRole,
                role: data.role,
            },
            token: (0, jsonwebtoken_1.sign)({ idUser: data.idUsers }, type_1.secret, { expiresIn: "2h" }),
        });
    });
});
exports.login = login;
const fetchAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersData = yield (0, method_1.fetchTableData)("v_membre_user", "WHERE login != 'SuperAdmin' Order by idRole DESC");
        if (usersData.length) {
            let allUsers = [];
            usersData.map((items) => {
                let data = {
                    idUsers: items.idUsers,
                    login: items.login,
                    nomComplet: `${items.nom} ${items.prenom}`,
                    role: items.role,
                    profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                };
                allUsers.push(data);
            });
            res.status(200).json(allUsers);
            return;
        }
        else
            return [];
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.fetchAllUsers = fetchAllUsers;
const fetchOneUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const OneUsersData = yield (0, method_1.fetchTableColumns)("users", ["idUsers"], [id]);
        if (OneUsersData.length) {
            const items = OneUsersData[0];
            let data = {
                idUsers: items.idUsers,
                login: items.login,
                membre: items.fkMembre,
                role: items.fkRole,
            };
            res.status(200).json(data);
            return;
        }
        else
            return [];
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.fetchOneUsers = fetchOneUsers;
const fetchAllRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleData = yield (0, method_1.fetchTableData)("role", "Order by idRole DESC");
        if (roleData.length) {
            const allRole = roleData.map((items) => ({
                value: items.idRole,
                label: `${items.role}`,
            }));
            allRole.unshift({ value: "undefined", label: "Sélectionner role..." });
            res.status(200).json(allRole);
            return;
        }
        else
            return [];
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.fetchAllRole = fetchAllRole;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { login, role, mdp, confMdp } = req.body;
    const error = (0, method_1.checkError)({ login, role, mdp, confMdp }, {
        login: joi_1.default.string().required().messages({ "any.only": "Le login  est obligatoire" }),
        mdp: joi_1.default.string().allow("").messages({
            "string.empty": "Le mot de passe est obligatoire.",
        }),
        confMdp: joi_1.default.string().allow("").valid(joi_1.default.ref("mdp")).messages({
            "any.only": "Les deux mots de passe sont incohérents.",
            "string.empty": "La confirmation du mot de passe est obligatoire.",
        }),
        role: joi_1.default.number().required().messages({ "string.empty": "Selectionner un role" }),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json(error);
    try {
        const users = yield (0, method_1.fetchTableColumns)("users", ["idUsers"], [id]);
        let error = false;
        if (users.length) {
            if (users[0].login != login) {
                const updateLogin = yield (0, method_1.updateData)("users", ["login"], ["idUsers"], [login, id]);
                if (!updateLogin)
                    error = true;
            }
            if (users[0].fkRole != role) {
                const updateRole = yield (0, method_1.updateData)("users", ["fkRole"], ["idUsers"], [role, id]);
                if (!updateRole)
                    error = true;
            }
            if (mdp && confMdp) {
                (0, bcrypt_1.hash)(mdp, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err) {
                        return res.status(400).json({ message: "erreur survenu lors du cryptage, veuillez reessayer plutard" });
                    }
                    const updateMdp = yield (0, method_1.updateData)("users", ["mdp"], ["idUsers"], [hash, id]);
                    if (!updateMdp)
                        error = true;
                }));
            }
            else {
                return res.status(200).json({ message: "Modification réussi sans le mot de passe" });
            }
            if (error)
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" });
            else
                return res.status(200).json({ message: "Modification réussi" });
        }
    }
    catch (error) { }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.string().required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    if (yield (0, method_1.isFindColumn)("users", ["idUsers"], [id])) {
        if (yield (0, method_1.deleteData)("users", ["idUsers"], [id])) {
            return res.status(200).json({ message: "Supression reussi" });
        }
    }
    else {
        return res.status(400).json({ message: "Cet utilisateur n'existe pas" });
    }
});
exports.deleteUser = deleteUser;
