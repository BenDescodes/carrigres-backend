"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailOption = exports.transporter = void 0;
const nodemailer = require("nodemailer");
require("dotenv").config(); // Pour charger les variables d'environnement
// Configuration du transporteur avec un serveur SMTP personnalisé
exports.transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Adresse du serveur SMTP (ex: smtp.example.com)
    port: process.env.SMTP_PORT, // Port SMTP (587 pour STARTTLS, 465 pour SSL, 25 sans chiffrement)
    secure: process.env.SMTP_SECURE === "true", // true pour SSL (465), false pour STARTTLS (587)
    auth: {
        user: process.env.SMTP_USER, // Nom d'utilisateur SMTP
        pass: process.env.SMTP_PASS, // Mot de passe SMTP
    },
});
// Définition des options de l'email
function getMailOption(expediteur, message) {
    return {
        from: '"Assemblée Chrétienne de CARRIGRES" <suggestion@asscarrigres.com>', // Expéditeur
        to: "suggestion@asscarrigres.com", // Destinataire
        subject: "Question & Suggestion au Pasteur Kapanga",
        text: "Bonjour, ceci est un test d'email envoyé avec un serveur SMTP personnalisé.",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <h6 style="color: #333333; text-align: center; font-weight : bold">${expediteur}</h6>
                <hr style="border: none; border-top: 2px solid #ccc; margin: 10px 0;">
                <p style="color: #555555; font-size: 14px; line-height: 1.5;">
                    ${message}
                </p>
                <br>
                <p style="font-size: 14px; color: #777777; text-align: center; padding-top: 20px">
                    Assemblée Chrétienne de CARRIGRES<br>
                    <a href="www.asscarrigres.com" style="color: #007bff; text-decoration: none;">www.asscarrigres.com</a>
                </p>
            </div>
        </div>
        `,
    };
}
exports.getMailOption = getMailOption;
