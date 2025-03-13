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
exports.suggestion = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const sendMail_1 = require("../helper/sendMail");
const suggestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nom, prenom, message } = req.body;
    const error = (0, method_1.checkError)(req.body, {
        nom: joi_1.default.string().required().messages({ "any.required": "Entrer le champ nom correctement" }),
        prenom: joi_1.default.string().required().messages({ "any.required": "Entrer le champ prenom correctement" }),
        message: joi_1.default.string().required().messages({ "any.required": "Entrer le champ nom correctement" }),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const findMembreNom = yield (0, method_1.fetchTableColumns)("membre", ["nom", "prenom"], [nom, prenom]);
        if (findMembreNom.length) {
            const expediteur = `${findMembreNom[0].sexe == "M" ? "Frère" : "Soeur"} ${nom} ${prenom}`;
            const mailOptions = (0, sendMail_1.getMailOption)(expediteur, message);
            sendMail_1.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(400).json({ message: "Erreur lors de l'envoi du message, essayer plustard" });
                }
                else {
                    res.status(200).json({ message: "Message envoyer" });
                }
            });
        }
        else {
            return res.status(400).json({ message: "Vous n'êtes pas membre veuillez vous enregistez " });
        }
    }
    catch (error) {
        res.status(400).json({ message: error || "An error occurred" });
    }
});
exports.suggestion = suggestion;
