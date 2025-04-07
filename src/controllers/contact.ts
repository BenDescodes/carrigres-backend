import Joi from "joi"
import { checkError, fetchTableColumns } from "../helper/method"
import { Request, Response } from "express"

import { getMailOption, transporter } from "../helper/sendMail"

export const suggestion = async (req: Request, res: Response) => {
    const { nom, prenom, message } = req.body
    const error = checkError(req.body, {
        nom: Joi.string().required().messages({ "any.required": "Entrer le champ nom correctement" }),
        prenom: Joi.string().required().messages({ "any.required": "Entrer le champ prenom correctement" }),
        message: Joi.string().required().messages({ "any.required": "Entrer le champ nom correctement" }),
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const findMembreNom: any[] = await fetchTableColumns("membre", ["nom", "prenom"], [nom, prenom])
        if (findMembreNom.length) {
            const expediteur = `${findMembreNom[0].sexe == "M" ? "Frère" : "Soeur"} ${nom} ${prenom}`
            const mailOptions = getMailOption(expediteur, message)
            transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
                if (error) {
                    res.status(400).json({ message: "Erreur lors de l'envoi du message, essayer plustard" })
                } else {
                    res.status(200).json({ message: "Message envoyer" })
                }
            })
        } else {
            return res.status(400).json({ message: "Vous n'êtes pas membre veuillez vous enregistez " })
        }
    } catch (error: any) {
        res.status(400).json({ message: error || "An error occurred" })
    }
}
