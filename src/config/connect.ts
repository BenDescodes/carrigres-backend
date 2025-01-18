import mysql from "mysql"

const host = "localhost",
    username = "root",
    database = "carrigresWebsite",
    password = "admin1234"
/* username = "c2503752c_adminWeb",
    database = "c2503752c_carrigresWebsite",
    password = "AdminWeb207" */

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
