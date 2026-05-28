const Joi = require("joi")
import type { SchemaMap } from "joi"
/* import connect from "../config/connect" */
const { query } = require("../config/connect")

/**
 * Génère une clause WHERE comme:  `col1 = ? AND col2 = ?`
 * @param fields  Liste de colonnes à filtrer
 * @param useComma Si true => sépare par virgule (pour UPDATE SET), sinon par AND (pour WHERE)
 */
export function fetchTableFields(fields: string[], useComma = false): string {
    const separator = useComma ? ", " : " AND "
    return fields
        .map((col) => {
            if (!/^[a-zA-Z0-9_]+$/.test(col)) {
                throw new Error(`Invalid column name: ${col}`)
            }
            return `\`${col}\` = ?`
        })
        .join(separator)
}

/* export function fetchTableFields(fields: string[], comma = false): string {
  const sep = comma ? ", " : " AND ";
  return fields
    .map((c) => `${safeName(c)} = ?`)
    .join(sep);
} */

export function safeName(name: string): string {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error(`Invalid identifier: ${name}`)
    }
    return "`" + name + "`"
}

/**
 * Vérifie si une ligne existe dans la table donnée en fonction de colonnes/valeurs.
 * @returns true si au moins une ligne correspond
 * const fields = ["email"];
 * const values = ["alice@example.com"];
 * const exists = await isFindColumn("participants", fields, values);
 * console.log("Email déjà utilisé ?", exists);
 */
export async function isFindColumn(table: string, fields: string[], values: unknown[], clause = ""): Promise<boolean> {
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        throw new Error("Invalid table name")
    }

    const where = fetchTableFields(fields)
    const sql = `SELECT COUNT(*) AS nb FROM \`${table}\` WHERE ${where} ${clause}`

    const rows = await query(sql, values)
    return rows.length > 0 && rows[0].nb > 0
}

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
export async function fetchTableData<T>(table: string, clause = ""): Promise<T[]> {
    const sql = `SELECT * FROM ${safeName(table)} ${clause}`
    return query(sql)
}

/*
    Sélection avec conditions dynamiques
    const fields = ["email", "sexe"];      // colonnes pour WHERE
    const values = ["alice@example.com", "F"];
    const rows = await fetchTableColumns("participants", fields, values, "ORDER BY nom ASC");
*/

export async function fetchTableColumns<T>(table: string, fields: string[], values: unknown[], clause = ""): Promise<T[]> {
    if (!table.match(/^[a-zA-Z0-9_]+$/)) {
        throw new Error("Invalid table name")
    }
    // Génère "col1 = ? AND col2 = ?" etc.
    const where = fields
        .map((f) => {
            if (!f.match(/^[a-zA-Z0-9_]+$/)) {
                throw new Error(`Invalid column name: ${f}`)
            }
            return `\`${f}\` = ?`
        })
        .join(" AND ")

    const sql = `SELECT * FROM \`${table}\` WHERE ${where} ${clause}`

    return query(sql, values)
}
// Compte les lignes d'une table const res = await countTableData("participants")
export async function countTableData(table: string): Promise<number> {
    const rows = await query(`SELECT COUNT(*) AS count FROM ${safeName(table)}`)
    return rows[0]?.count ?? 0
}

// Création d'une ligne

/*
    const columns = ["nom", "prenom", "email"];
    const placeholders = ["?", "?", "?"];
    const values = ["Durand", "Alice", "alice@example.com"];
    const result = await createData("participants", columns, placeholders, values);
*/
export async function createData(table: string, columns: string[], values: any[], p0?: any[]): Promise<any> {
    const cols = columns.map(safeName).join(", ")
    const placeholders = columns.map(() => "?").join(", ")
    const sql = `INSERT INTO ${safeName(table)} (${cols}) VALUES (${placeholders})`
    return query(sql, values)
}

// Mise à jour
/*
    const columns = ["email"];              // colonnes à modifier
    const filters = ["idParticipants"];     // colonnes pour WHERE
    const values = ["newmail@example.com", 42]; // nouvelle valeur + valeur du filtre
    const res = await updateData("participants", columns, filters, values);
*/
export async function updateData(table: string, columns: string[], filters: string[], values: any[]): Promise<any> {
    const setPart = fetchTableFields(columns, true)
    const wherePart = fetchTableFields(filters)
    const sql = `UPDATE ${safeName(table)} SET ${setPart} WHERE ${wherePart}`
    return query(sql, values)
}

// Suppression
/*
    const filters = ["idParticipants"];
    const values = [42]; // ID du participant à supprimer
    const res = await deleteData("participants", filters, values);
*/
export async function deleteData(table: string, filters: string[], values: any[]): Promise<any> {
    const wherePart = fetchTableFields(filters)
    const sql = `DELETE FROM ${safeName(table)} WHERE ${wherePart}`
    return query(sql, values)
}

/* 

/**
 * Valide des données avec un schéma Joi.
 * @param data   Données à valider (ex: req.body)
 * @param rules  Objet de règles Joi (ex: { email: Joi.string().email().required() })
 * @returns      Tableau d'erreurs [{ field, message }] ou [] si aucune erreur
 */
export const checkError = (data: unknown, rules: SchemaMap): Array<{ field: string; message: string }> => {
    const schema = Joi.object(rules)
    const { error } = schema.validate(data, { abortEarly: false })

    if (!error) return []

    return error.details.map((detail: any) => ({
        field: detail.context?.label ?? detail.path.join("."),
        message: detail.message,
    }))
}
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
