"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const host = "localhost", username = "root", database = "carrigresWebsite", password = "admin1234";
/* username = "c2503752c_adminWeb",
    database = "c2503752c_carrigresWebsite",
    password = "AdminWeb207" */
const config = {
    host: host,
    user: username,
    password: password,
    database: database,
};
const connection = mysql_1.default.createConnection(config);
connection.connect((err) => {
    if (err) {
        console.error("Erreur de connexion : " + err.message);
        return;
    }
});
exports.default = connection;
