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
Object.defineProperty(exports, "__esModule", { value: true });
exports.successMessage = exports.ErrorMessage = exports.checkError = exports.deleteData = exports.updateData = exports.createData = exports.countTableData = exports.fetchTableColumns = exports.fetchTableData = exports.isFindColumn = exports.safeName = exports.fetchTableFields = void 0;
const Joi = require("joi");
/* import connect from "../config/connect" */
const { query } = require("../config/connect");
/**
 * Génère une clause WHERE comme:  `col1 = ? AND col2 = ?`
 * @param fields  Liste de colonnes à filtrer
 * @param useComma Si true => sépare par virgule (pour UPDATE SET), sinon par AND (pour WHERE)
 */
function fetchTableFields(fields, useComma = false) {
    const separator = useComma ? ", " : " AND ";
    return fields
        .map((col) => {
        if (!/^[a-zA-Z0-9_]+$/.test(col)) {
            throw new Error(`Invalid column name: ${col}`);
        }
        return `\`${col}\` = ?`;
    })
        .join(separator);
}
exports.fetchTableFields = fetchTableFields;
/* export function fetchTableFields(fields: string[], comma = false): string {
  const sep = comma ? ", " : " AND ";
  return fields
    .map((c) => `${safeName(c)} = ?`)
    .join(sep);
} */
function safeName(name) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error(`Invalid identifier: ${name}`);
    }
    return "`" + name + "`";
}
exports.safeName = safeName;
/**
 * Vérifie si une ligne existe dans la table donnée en fonction de colonnes/valeurs.
 * @returns true si au moins une ligne correspond
 * const fields = ["email"];
 * const values = ["alice@example.com"];
 * const exists = await isFindColumn("participants", fields, values);
 * console.log("Email déjà utilisé ?", exists);
 */
function isFindColumn(table, fields, values, clause = "") {
    return __awaiter(this, void 0, void 0, function* () {
        if (!/^[a-zA-Z0-9_]+$/.test(table)) {
            throw new Error("Invalid table name");
        }
        const where = fetchTableFields(fields);
        const sql = `SELECT COUNT(*) AS nb FROM \`${table}\` WHERE ${where} ${clause}`;
        const rows = yield query(sql, values);
        return rows.length > 0 && rows[0].nb > 0;
    });
}
exports.isFindColumn = isFindColumn;
/**
 * Sélectionne des lignes depuis une table en fonction d'un ensemble de colonnes/valeurs.
 * @param table Nom de la table (valider avant appel !)
 * @param fields Tableau des colonnes filtrantes
 * @param values Tableau des valeurs correspondantes
 * @param clause Clause additionnelle (ex: "ORDER BY date DESC") — valider si utilisé
 */
/* Récupère toutes les données d'une table avec clause optionnelle
    const rows = await fetchTableData("livres")
    const romans = await fetchTableData("livres", "WHERE categorieLivre = 1 ORDER BY datePublication DESC")
*/
function fetchTableData(table, clause = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `SELECT * FROM ${safeName(table)} ${clause}`;
        return query(sql);
    });
}
exports.fetchTableData = fetchTableData;
/*
    Sélection avec conditions dynamiques
    const fields = ["email", "sexe"];      // colonnes pour WHERE
    const values = ["alice@example.com", "F"];
    const rows = await fetchTableColumns("participants", fields, values, "ORDER BY nom ASC");
*/
function fetchTableColumns(table, fields, values, clause = "") {
    return __awaiter(this, void 0, void 0, function* () {
        if (!table.match(/^[a-zA-Z0-9_]+$/)) {
            throw new Error("Invalid table name");
        }
        // Génère "col1 = ? AND col2 = ?" etc.
        const where = fields
            .map((f) => {
            if (!f.match(/^[a-zA-Z0-9_]+$/)) {
                throw new Error(`Invalid column name: ${f}`);
            }
            return `\`${f}\` = ?`;
        })
            .join(" AND ");
        const sql = `SELECT * FROM \`${table}\` WHERE ${where} ${clause}`;
        return query(sql, values);
    });
}
exports.fetchTableColumns = fetchTableColumns;
// Compte les lignes d'une table const res = await countTableData("participants")
function countTableData(table) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield query(`SELECT COUNT(*) AS count FROM ${safeName(table)}`);
        return (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0;
    });
}
exports.countTableData = countTableData;
// Création d'une ligne
/*
    const columns = ["nom", "prenom", "email"];
    const placeholders = ["?", "?", "?"];
    const values = ["Durand", "Alice", "alice@example.com"];
    const result = await createData("participants", columns, placeholders, values);
*/
function createData(table, columns, values, p0) {
    return __awaiter(this, void 0, void 0, function* () {
        const cols = columns.map(safeName).join(", ");
        const placeholders = columns.map(() => "?").join(", ");
        const sql = `INSERT INTO ${safeName(table)} (${cols}) VALUES (${placeholders})`;
        return query(sql, values);
    });
}
exports.createData = createData;
// Mise à jour
/*
    const columns = ["email"];              // colonnes à modifier
    const filters = ["idParticipants"];     // colonnes pour WHERE
    const values = ["newmail@example.com", 42]; // nouvelle valeur + valeur du filtre
    const res = await updateData("participants", columns, filters, values);
*/
function updateData(table, columns, filters, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const setPart = fetchTableFields(columns, true);
        const wherePart = fetchTableFields(filters);
        const sql = `UPDATE ${safeName(table)} SET ${setPart} WHERE ${wherePart}`;
        return query(sql, values);
    });
}
exports.updateData = updateData;
// Suppression
/*
    const filters = ["idParticipants"];
    const values = [42]; // ID du participant à supprimer
    const res = await deleteData("participants", filters, values);
*/
function deleteData(table, filters, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const wherePart = fetchTableFields(filters);
        const sql = `DELETE FROM ${safeName(table)} WHERE ${wherePart}`;
        return query(sql, values);
    });
}
exports.deleteData = deleteData;
/*

/**
 * Valide des données avec un schéma Joi.
 * @param data   Données à valider (ex: req.body)
 * @param rules  Objet de règles Joi (ex: { email: Joi.string().email().required() })
 * @returns      Tableau d'erreurs [{ field, message }] ou [] si aucune erreur
 */
const checkError = (data, rules) => {
    const schema = Joi.object(rules);
    const { error } = schema.validate(data, { abortEarly: false });
    if (!error)
        return [];
    return error.details.map((detail) => {
        var _a, _b;
        return ({
            field: (_b = (_a = detail.context) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : detail.path.join("."),
            message: detail.message,
        });
    });
};
exports.checkError = checkError;
/*
export const ErrorMessage = {
    erreur500: "Erreur survenu lors la connexion veuillez réessayer plutard merci!",
    erreurMdp: "Mot de passe ou nom d'utilisateur incorrect",
    erreurInscription: "Erreur survenu lors de votre inscription veuillez réessayer plutard merci!",
    noAccess: "Vous  n'avez pas le droit d'effectuer cette operation",
    ajout: "erreur survenu lors de l'ajout",
    notFound: "information non disponible",
    save: "Erreur survenu lors de l'enregistrement",
    edit: "impossible de modifier une information indisponible",
    delete: "Erreur survenu lors de la suppression",
}
export const successMessage = {
    save: "Enregistrement réussi",
}
 

/*

const { withTransaction } = require("./db");

async function createBookAndAuthor(book, author) {
  return withTransaction(async (conn) => {
    const [authorRes] = await conn.execute(
      "INSERT INTO participants (nom, prenom) VALUES (?, ?)",
      [author.nom, author.prenom]
    );
    const authorId = authorRes.insertId;

    const [bookRes] = await conn.execute(
      "INSERT INTO livres (titre, participantId) VALUES (?, ?)",
      [book.titre, authorId]
    );

    return { authorId, bookId: bookRes.insertId };
  });
}


*/
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
