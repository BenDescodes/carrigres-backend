/*import mysql from "mysql"

const host = "localhost",
    username = "root",
    database = "carrigresWebsite",
    password = "admin1234"
 username = "c2503752c_adminWeb",
    database = "c2503752c_carrigresWebsite",
    password = "AdminWeb207" 

const config = {
    host: host,
    user: username,
    password: password,
    database: database,
}

const connection = mysql.createConnection(config)

connection.connect((err) => {
    if (err) {
        console.error("Erreur de connexion : " + err.message)
        return
    }
})

export default connection
*/

// src/db.js
const dotenv = require("dotenv")
const mysql = require("mysql2/promise")

dotenv.config() // charge .env

// Configuration depuis les variables d'environnement
const DB_HOST = process.env.DB_HOST || "127.0.0.1"
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || "admin1234"
const DB_DATABASE = process.env.DB_DATABASE || "carrigreswebsiteteste"
const DB_CONNECTION_LIMIT = process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10
const DB_WAIT_FOR_CONNECTIONS = process.env.DB_WAIT_FOR_CONNECTIONS === "false" ? false : true

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
})

/**
 * Exécuter une requête SQL paramétrée.
 * @param {string} sql Requête avec des `?`
 * @param {Array<any>} params Paramètres de la requête
 * @returns {Promise<Array>} rows
 */
async function query(sql, params = []) {
    const conn = await pool.getConnection()
    try {
        const [rows] = await conn.execute(sql, params)
        return rows
    } finally {
        conn.release()
    }
}

/**
 * Gérer une transaction.
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<any>} callback
 */
async function withTransaction(callback) {
    const conn = await pool.getConnection()
    try {
        await conn.beginTransaction()
        const result = await callback(conn)
        await conn.commit()
        return result
    } catch (err) {
        try {
            await conn.rollback()
        } catch (rollbackErr) {
            console.error("Rollback error:", rollbackErr)
        }
        throw err
    } finally {
        conn.release()
    }
}

/**
 * Fermer le pool proprement
 */
async function closePool() {
    try {
        await pool.end()
        console.log("Database pool closed.")
    } catch (err) {
        console.error("Error closing database pool:", err)
    }
}

// Fermeture propre lors de l'arrêt du process
async function gracefulShutdown() {
    console.log("Shutting down - closing DB pool...")
    await closePool()
}

process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)

module.exports = {
    pool,
    query,
    withTransaction,
    closePool,
}
