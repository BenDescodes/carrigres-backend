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
/*import mysql from "mysql"

const host = "localhost",
    username = "root",
    database = "carrigreswebsiteteste",
    password = "admin1234"

    username = "c2503752c_adminWeb",
    database = "c2503752c_carrigresWebsite",
    password = "AdminWeb207"

*/
// src/db.js
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
dotenv.config(); // charge .env
// Configuration depuis les variables d'environnement
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER || "c2503752c_adminWeb";
const DB_PASSWORD = process.env.DB_PASSWORD || "AdminWeb207";
const DB_DATABASE = process.env.DB_DATABASE || "c2503752c_carrigresWebsite";
const DB_CONNECTION_LIMIT = process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10;
const DB_WAIT_FOR_CONNECTIONS = process.env.DB_WAIT_FOR_CONNECTIONS === "false" ? false : true;
// Création du pool
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: DB_WAIT_FOR_CONNECTIONS,
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: 0,
});
/**
 * Exécuter une requête SQL paramétrée.
 * @param {string} sql Requête avec des `?`
 * @param {Array<any>} params Paramètres de la requête
 * @returns {Promise<Array>} rows
 */
function query(sql, params = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield pool.getConnection();
        try {
            const [rows] = yield conn.execute(sql, params);
            return rows;
        }
        finally {
            conn.release();
        }
    });
}
/**
 * Gérer une transaction.
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<any>} callback
 */
function withTransaction(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield pool.getConnection();
        try {
            yield conn.beginTransaction();
            const result = yield callback(conn);
            yield conn.commit();
            return result;
        }
        catch (err) {
            try {
                yield conn.rollback();
            }
            catch (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
            }
            throw err;
        }
        finally {
            conn.release();
        }
    });
}
/**
 * Fermer le pool proprement
 */
function closePool() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield pool.end();
            console.log("Database pool closed.");
        }
        catch (err) {
            console.error("Error closing database pool:", err);
        }
    });
}
// Fermeture propre lors de l'arrêt du process
function gracefulShutdown() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Shutting down - closing DB pool...");
        yield closePool();
    });
}
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
module.exports = {
    pool,
    query,
    withTransaction,
    closePool,
};
