"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.successMessage = exports.ErrorMessage = exports.cancelTransaction = exports.commitTransaction = exports.startTransaction = exports.checkError = exports.personalQueryAsync = exports.deleteData = exports.updateData = exports.createData = exports.fetchTableData = exports.countTableData = exports.fetchTableColumns = exports.isFindColumn = void 0;
const joi_1 = __importDefault(require("joi"));
const connect_1 = __importDefault(require("../config/connect"));
const fetchTableFields = (fields, clause) => {
    const field = [];
    for (let index = 0; index < fields.length; index++) {
        field.push(`${fields[index]} = ? `);
    }
    return field.join(clause ? ", " : " AND ");
};
const isFindColumn = (table, fields, values, clause = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT COUNT(*) AS nb FROM " + table + " WHERE " + fetchTableFields(fields) + " " + clause;
        connect_1.default.query(script, values, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res[0].nb > 0);
        });
    });
};
exports.isFindColumn = isFindColumn;
const fetchTableColumns = (table, fields, values, clause = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT *  FROM " + table + " WHERE " + fetchTableFields(fields) + " " + clause;
        connect_1.default.query(script, values, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.fetchTableColumns = fetchTableColumns;
const countTableData = (table) => {
    return new Promise((resolve, reject) => {
        let script = "SELECT COUNT(*) count  FROM " + table;
        connect_1.default.query(script, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.countTableData = countTableData;
const fetchTableData = (table, clause = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT *  FROM " + table + " " + clause;
        connect_1.default.query(script, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.fetchTableData = fetchTableData;
const createData = (table, columns, affect, value) => {
    return new Promise((resolve, reject) => {
        let script = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + affect.join(",") + ")";
        connect_1.default.query(script, value, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.createData = createData;
const updateData = (table, columns, filter, values) => {
    return new Promise((resolve, reject) => {
        let script = "UPDATE " + table + " SET " + fetchTableFields(columns, true) + " WHERE " + fetchTableFields(filter);
        connect_1.default.query(script, values, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.updateData = updateData;
const deleteData = (table, columns, values) => {
    return new Promise((resolve, reject) => {
        let script = "DELETE FROM  " + table + " WHERE " + fetchTableFields(columns);
        connect_1.default.query(script, values, (error, res) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(res);
        });
    });
};
exports.deleteData = deleteData;
//requette personnel avec les parametre
const personalQueryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
        connect_1.default.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.personalQueryAsync = personalQueryAsync;
const checkError = (req, params) => {
    var _a;
    const schema = joi_1.default.object(params);
    const { error } = schema.validate(req);
    if (error) {
        const errors = error.details;
        const listErrors = [];
        for (let index = 0; index < errors.length; index++) {
            const element = errors[index];
            listErrors.push({ field: (_a = element.context) === null || _a === void 0 ? void 0 : _a.label, message: element.message });
        }
        return listErrors;
    }
};
exports.checkError = checkError;
const startTransaction = () => {
    return new Promise((resolve, reject) => {
        connect_1.default.query("START TRANSACTION", (error) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(true);
        });
    });
};
exports.startTransaction = startTransaction;
const commitTransaction = () => {
    return new Promise((resolve, reject) => {
        connect_1.default.query("COMMIT", (error) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(true);
        });
    });
};
exports.commitTransaction = commitTransaction;
const cancelTransaction = () => {
    return new Promise((resolve, reject) => {
        connect_1.default.query("ROLLBACK", (error) => {
            if (error) {
                reject({ error: error });
                return;
            }
            resolve(true);
        });
    });
};
exports.cancelTransaction = cancelTransaction;
exports.ErrorMessage = {
    erreur500: "Erreur survenu lors la connexion veuillez réessayer plutard merci!",
    erreurMdp: "Mot de passe ou nom d'utilisateur incorrect",
    erreurInscription: "Erreur survenu lors de votre inscription veuillez réessayer plutard merci!",
    noAccess: "Vous  n'avez pas le droit d'effectuer cette operation",
    ajout: "erreur survenu lors de l'ajout",
    notFound: "information non disponible",
    save: "Erreur survenu lors de l'enregistrement",
    edit: "impossible de modifier une information indisponible",
    delete: "Erreur survenu lors de la suppression",
};
exports.successMessage = {
    save: "Enregistrement réussi",
};
