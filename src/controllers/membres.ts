import Joi from "joi"
import { Request, Response } from "express"
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData, updateData } from "../helper/method"
import { fileCompresse } from "../middleware/multerConfig"
import randomstring from "randomstring"
import path from "path"
import moment from "moment"
import fs from "fs"
moment.locale("fr")
const { query } = require("../config/connect")

export const fetchAllMembre = async (req: Request, res: Response) => {
    const baseUrlProfil = `${req.protocol}://${req.get("host")}/src/images/`
    try {
        const membres: any[] = await fetchTableData("v_membre_all", "ORDER by idMembre DESC")
        if (!membres?.length) return res.status(200).json([])

        const allMembre = membres.map((items: any) => ({
            idMembre: items.idMembre,
            nom: items.nom,
            prenom: items.prenom,
            postnom: items.postnom,
            telephone: items.telephone,
            anneeNaissance: items.anneeNaissance,
            email: items.email,
            sexe: items.sexe,
            dateEnreg: moment(items.dateEnreg).format("L"),
            avenue: items.avenue,
            quartier: items.quartier,
            commune: items.commune,
            reference: items.reference,
            conjoint: items.nomConjoint && `${items.nomConjoint} ${items.prenomConjoint}`,
            batise: items.isBaptise ? "Oui" : "Non",
            /* decede: items.idDecede,
            dateDecede: items.dateDecede, */
            profil: items.profil ? `${baseUrlProfil}${items.profil}` : null,
            tkMembre: items.tkMembre,
        }))

        return res.status(200).json(allMembre)
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const fetchOneMembre = async (req: Request, res: Response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.required(),
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        const membres: any[] = await fetchTableColumns("membre", ["tkMembre"], [id])
        membres.map((items: any) => {
            const data = {
                idMembre: items.idMembre,
                nom: items.nom,
                prenom: items.prenom,
                postnom: items.postnom,
                telephone: items.telephone,
                anneeNaissance: items.anneeNaissance,
                email: items.email,
                sexe: items.sexe,
                avenue: items.avenue,
                quartier: items.quartier,
                commune: items.commune,
                conjoint: items.fkConjoint,
                baptise: items.isBaptise,
                decede: items.idDecede,
                dateDecede: items.dateDecede,
                profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                tkMembre: items.tkMembre,
            }
            return res.status(200).json(data)
        })
    } catch (error) {
        return res.status(404).json(error)
    }
}

export const createMembre = async (req: Request, res: Response) => {
    let {
            nom,
            prenom,
            postnom,
            telephone,
            anneeNaissance,
            email,
            sexe,
            avenue,
            quartier,
            commune,
            reference,
            conjoint,
            baptise,
            marie,
        } = req.body,
        { profil } = req.files as { profil?: Express.Multer.File[] },
        file: any = profil ? profil[0].filename : null,
        extension: any = file ? path.extname(file) : null,
        token: string = randomstring.generate(6),
        error: any = checkError(req.body, {
            nom: Joi.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
            prenom: Joi.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
            postnom: Joi.string().allow(""),
            anneeNaissance: Joi.number(),
            email: Joi.string().email().message("Inserer un bon mail").allow(""),
            telephone: Joi.string()
                .pattern(/^(?:\+\d{1,3})?\d{9,10}$/)
                .allow("")
                .messages({
                    "string.pattern.base":
                        "Le numéro de téléphone doit contenir 10 chiffres ou commencer par un indicatif de pays suivi de 10 chiffres.",
                    "any.required": "Le numéro de téléphone est requis.",
                }),
            sexe: Joi.string().max(1).message("Un seul caractere"),
            avenue: Joi.string(),
            quartier: Joi.string(),
            commune: Joi.string(),
            reference: Joi.string(),
            baptise: Joi.string(),
            conjoint: Joi.allow(""),
            marie: Joi.allow(""),
            profil: Joi.string(),
        })

    if (error?.length) return res.status(400).json({ error })

    conjoint = conjoint == "undefined" ? null : conjoint
    marie = marie == "undefined" ? null : marie
    baptise = baptise == "true" ? true : false

    try {
        if (!(await isFindColumn("membre", ["nom", "prenom", "postnom", "telephone"], [nom, prenom, postnom, telephone]))) {
            if (file && profil?.[0]) {
                fileCompresse(extension, profil[0])
            }
            const membre: any = await createData(
                "membre",
                [
                    "nom",
                    "prenom",
                    "postnom",
                    "telephone",
                    "anneeNaissance",
                    "email",
                    "sexe",
                    "avenue",
                    "quartier",
                    "commune",
                    "reference",
                    "fkconjoint",
                    "isBaptise",
                    "tkMembre",
                    "profil",
                ],
                [
                    nom,
                    prenom,
                    postnom,
                    telephone,
                    anneeNaissance,
                    email,
                    sexe,
                    avenue,
                    quartier,
                    commune,
                    reference,
                    conjoint,
                    baptise,
                    token,
                    file,
                ]
            )
            if (membre) {
                if (conjoint) {
                    //mettre à jour la colone marier chez un l'autre membre choisie dans le formulaire
                    const lastInsertId = membre?.insertId
                    const updateMembreMarie = updateData("membre", ["fkConjoint"], ["idMembre"], [lastInsertId, conjoint])
                }
                res.status(200).json({ message: "Enregistrement effectué" })
            } else
                res.status(400).json({
                    success: 0,
                    message: "Erreur survenu lors de l'enregistrement",
                })
            return
        } else res.status(400).json({ message: "Ce Membre existe déjà" })
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const updateMembre = async (req: Request, res: Response) => {
    const { id } = req.params
    let { nom, prenom, postnom, telephone, anneeNaissance, email, sexe, avenue, quartier, commune, conjoint, baptise, idMembre } =
        req.body
    const error = checkError(
        {
            nom,
            prenom,
            postnom,
            telephone,
            anneeNaissance,
            email,
            sexe,
            avenue,
            quartier,
            commune,
            conjoint,
            baptise,
            idMembre,
        },
        {
            nom: Joi.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
            prenom: Joi.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
            postnom: Joi.string().allow(""),
            anneeNaissance: Joi.number(),
            email: Joi.string().email().message("Inserer un bon mail").allow(""),
            telephone: Joi.number(),
            sexe: Joi.string().max(1).message("Un seul caractere"),
            avenue: Joi.string(),
            quartier: Joi.string(),
            commune: Joi.string(),
            baptise: Joi.number(),
            conjoint: Joi.allow(""),
            profil: Joi.string(),
            idMembre: Joi.number(),
        }
    )
    if (error?.length) {
        console.log(error)
        return res.status(400).json({ error })
    }

    conjoint = conjoint == "undefined" ? null : conjoint
    baptise = baptise == "true" ? true : false

    try {
        const membre: any[] = await fetchTableColumns("membre", ["tkMembre"], [id])
        let error: boolean = false
        if (membre.length) {
            if (membre[0].nom != nom) {
                const updateNom = await updateData("membre", ["nom"], ["tkMembre"], [nom, id])
                if (!updateNom) error = true
            }
            if (membre[0].prenom != prenom) {
                const updatePrenom = await updateData("membre", ["prenom"], ["tkMembre"], [prenom, id])
                if (!updatePrenom) error = true
            }
            if (membre[0].postnom != postnom) {
                const updatePostnom = await updateData("membre", ["postnom"], ["tkMembre"], [postnom, id])
                if (!updatePostnom) error = true
            }
            if (membre[0].telephone != telephone) {
                const updateTel = await updateData("membre", ["telephone"], ["tkMembre"], [telephone, id])
                if (!updateTel) error = true
            }
            if (membre[0].anneeNaissance != anneeNaissance) {
                const updateDateNaissance = await updateData("membre", ["anneeNaissance"], ["tkMembre"], [anneeNaissance, id])
                if (!updateDateNaissance) error = true
            }
            if (membre[0].email != email) {
                const updateEmail = await updateData("membre", ["email"], ["tkMembre"], [email, id])
                if (!updateEmail) error = true
            }
            if (membre[0].sexe != sexe) {
                const updateSexe = await updateData("membre", ["sexe"], ["tkMembre"], [sexe, id])
                if (!updateSexe) error = true
            }
            if (membre[0].avenue != avenue) {
                const updateAvenue = await updateData("membre", ["avenue"], ["tkMembre"], [avenue, id])
                if (!updateAvenue) error = true
            }
            if (membre[0].quartier != quartier) {
                const updateQuartier = await updateData("membre", ["quartier"], ["tkMembre"], [quartier, id])
                if (!updateQuartier) error = true
            }
            if (membre[0].commune != commune) {
                const updateCommune = await updateData("membre", ["commune"], ["tkMembre"], [commune, id])
                if (!updateCommune) error = true
            }
            if (membre[0].isBaptise != req.body.baptise) {
                console.log(req.body.baptise)
                const updateBaptise = await updateData("membre", ["isBaptise"], ["tkMembre"], [req.body.baptise, id])
                if (!updateBaptise) error = true
            }

            if (membre[0].fkConjoint != conjoint) {
                const value = null
                //mettre à jour l'ancien partenaire pour qu'il devient zero
                const updateOldConjoint = await updateData("membre", ["fkConjoint"], ["idMembre"], [value, membre[0].fkConjoint])
                //mettre le conjoint selectionner
                const updateConjoint = await updateData("membre", ["fkConjoint"], ["tkMembre"], [conjoint, id])
                //mettre à jour la colone marier chez un l'autre membre choisie dans le formulaire
                const updateMembreMarie = await updateData("membre", ["fkConjoint"], ["idMembre"], [idMembre, conjoint])
                if (!updateConjoint) error = true
            }

            if (error) {
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            } else {
                return res.status(200).json({ message: "Modification réussi" })
            }
        } else res.status(400).json({ messsage: "Ce membre n'existe pas " })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const updateProfilMembre = async (req: Request, res: Response) => {
    const { id } = req.params
    let { profil } = req.files as { profil?: Express.Multer.File[] },
        file: any = profil ? profil[0].filename : null,
        extension: any = file ? path.extname(file) : null
    if (file && profil?.[0]) {
        fileCompresse(extension, profil[0])
    }
    try {
        const membre: any[] = await fetchTableColumns("membre", ["tkMembre"], [id])
        if (membre.length) {
            //supprimer l'image pour laisser seulement le nouveau
            const updateProfilMembre = await updateData("membre", ["profil"], ["tkMembre"], [file, id])
            if (updateProfilMembre) return res.status(200).json({ message: "Modification réussi" })
            if (membre[0].profil) {
                const filePath = path.join(path.resolve(__dirname, ".."), "images", membre[0].profil)
                try {
                    fs.unlinkSync(filePath)
                    console.log("Fichier supprimé avec succès !")
                } catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err)
                }
            } else return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const deleteMembre = async (req: Request, res: Response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required(),
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        if (await isFindColumn("membre", ["tkMembre"], [id])) {
            const membres: any[] = await fetchTableColumns("membre", ["tkMembre"], [id])
            const filePath = path.join(path.resolve(__dirname, ".."), "images", membres[0].profil)
            console.log(filePath)
            if (membres[0].profil) {
                try {
                    fs.unlinkSync(filePath)
                    console.log("Fichier supprimé avec succès !")
                } catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err)
                }
            }
            if (await deleteData("membre", ["tkMembre"], [id])) {
                return res.status(200).json({ message: "Supression reussi" })
            }
        } else {
            return res.status(400).json({ message: "Ce membre n'existe pas" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}

//api pour afficher le marie et le celibataire
export const celibataireMembre = async (req: Request, res: Response) => {
    const { sexe } = req.params
    try {
        const celibataire: any[] = await fetchTableColumns("membre", ["sexe"], [sexe], "AND fkConjoint IS NULL")
        if (celibataire.length) {
            const allCelibataire = await Promise.all(
                celibataire.map((items: any) => ({
                    value: items.idMembre,
                    label: `${items.nom} ${items.postnom} ${items.prenom}`,
                }))
            )
            allCelibataire.unshift({ value: "undefined", label: "sélectionner..." })
            return res.status(200).json(allCelibataire)
        }
        return res.status(200).json([])
    } catch (error: any) {
        res.status(400).json({ message: error || "An error occurred" })
    }
}
//verification si on est membre
export const checkMembre = async (req: Request, res: Response) => {
    let { nom, prenom, postnom } = req.body
    const error = checkError(req.body, {
        nom: Joi.string().min(3).required().messages({ "any.required": "Entrer le champ nom correctement" }),
        prenom: Joi.string().min(3).required().messages({ "any.required": "Entrer le champ prenom correctement" }),
        postnom: Joi.string().allow(""),
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const script = "SELECT * FROM membre WHERE nom=? AND prenom=? AND postnom=?"
        const membresCheck: any = await query(script, [nom, prenom, postnom])
        if (membresCheck.length)
            return res.status(200).json({ message: "Merci ! Vous etês enregistré", membre: membresCheck[0].tkMembre })
        else return res.status(400).json({ message: "Erreur vous êtes pas encore enregistré" })
    } catch (error: any) {
        res.status(400).json({ message: error || "An error occurred" })
    }
}
export const checkOneMembre = async (req: Request, res: Response) => {
    const { tkMembre } = req.params
    if (tkMembre) {
        const oneMembre: any = await fetchTableColumns("v_membre_all", ["tkMembre"], [tkMembre])
        const script = "SELECT nom,prenom,tkMembre FROM membre WHERE fkPere = ?"
        const childrenMembre: any = await query(script, [oneMembre[0].idMembre])
        const items = oneMembre[0]
        const data = {
            idMembre: items.idMembre,
            nom: items.nom,
            prenom: items.prenom,
            postnom: items.postnom && items.postnom,
            telephone: items.telephone,
            anneeNaissance: items.anneeNaissance,
            email: items.email,
            sexe: items.sexe,
            avenue: items.avenue,
            quartier: items.quartier,
            commune: items.commune,
            /* fonction: items.fonction, */
            /*  pere: items.nomPere && `${items.nomPere} ${items.prenomPere}`,
            mere: items.nomMere && `${items.nomMere} ${items.prenomMere}`, */
            conjoint: items.nomConjoint && `${items.nomConjoint} ${items.prenomConjoint}`,
            tkConjoint: items.tkConjoint && items.tkConjoint,
            baptise: items.isBaptise ? "Oui" : "Non",
            egliseBaptise: items.egliseBaptise ? items.egliseBaptise : "Assemblée Chretienne de Carrigres",
            reference: items.reference,
            decede: items.idDecede,
            dateDecede: items.dateDecede,
            profil: items.profil && items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
            tkMembre: items.tkMembre,
            childrenMembre,
        }
        return res.status(200).json(data)
    }
}

export const activeMembre = async (req: Request, res: Response) => {
    try {
        const activeMembre: any[] = await fetchTableData("activeMembre")
        if (activeMembre.length) return res.status(200).json(activeMembre[0])
        else res.status(400).json({ message: "Pas activer" })
    } catch (error) {
        res.status(400).json(error)
    }
}
//api pour activer l'enregistrement des membres
export const createActiveMembre = async (req: Request, res: Response) => {
    try {
        const activeMembre: any[] = await fetchTableData("activeMembre")
        const valueActiveMembre = activeMembre[0].activeMembre
        const idActive = activeMembre && activeMembre[0].idActive
        let error: boolean = false
        let message = valueActiveMembre ? "Fermeture de l'enregistrement" : "Ouverture de l'enregistrement "
        if (valueActiveMembre || !valueActiveMembre) {
            const updateActiveMembre = await updateData(
                "activeMembre",
                ["activeMembre"],
                ["idActive"],
                [!valueActiveMembre, idActive]
            )
            if (!updateActiveMembre) error = true
        }
        if (error) return res.status(400).json({ message: "Erreur lors de l'activation" })
        else return res.status(200).json({ message })
    } catch (error) {
        return res.status(400).json(error)
    }
}
