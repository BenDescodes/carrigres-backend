import Joi from "joi"
import { request, response } from "../types/type"
import {
    createData,
    fetchTableData,
    fetchTableColumns,
    isFindColumn,
    checkError,
    deleteData,
    updateData,
    cancelTransaction,
    startTransaction,
    commitTransaction,
} from "../helper/method"
import { fileCompresse } from "../middleware/multerConfig"
import randomstring from "randomstring"
import path from "path"
import moment from "moment"
moment.locale("fr")

export const fetchAllMembre = async (req: request, res: response) => {
    try {
        const membres: any[] = await fetchTableData("v_membre_all", "ORDER by idMembre")
        if (membres) {
            let allMembre: any[] = []
            membres.map((items: any) => {
                let data = {
                    idMembre: items.idMembre,
                    nom: items.nom,
                    prenom: items.prenom,
                    postnom: items.postnom,
                    telephone: items.telephone,
                    dateNaissance: moment(items.dateNaissance).format("LL"),
                    email: items.email,
                    sexe: items.sexe,
                    avenue: items.avenue,
                    quartier: items.quartier,
                    commune: items.commune,
                    reference: items.reference,
                    fonction: items.fonction,
                    pere: items.nomPere && `${items.nomPere}  ${items.prenomPere}`,
                    mere: items.nomMere && `${items.nomMere}  ${items.prenomMere}`,
                    conjoint: items.nomConjoint && `${items.nomConjoint} ${items.prenomConjoint}`,
                    batise: items.isBaptise ? "Oui" : "Non",
                    egliseBaptise: items.egliseBaptise,
                    decede: items.idDecede,
                    dateDecede: items.dateDecede,
                    profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                    tkMembre: items.tkMembre,
                }
                allMembre.push(data)
            })
            return res.status(200).json(allMembre)
        } else res.status(200).json("Pas de membres")
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const fetchOneMembre = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.required(),
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        const membres: Array = await fetchTableColumns("membre", ["tkMembre"], [id])
        membres.map((items: any) => {
            const data = {
                idMembre: items.idMembre,
                nom: items.nom,
                prenom: items.prenom,
                postnom: items.postnom,
                telephone: items.telephone,
                dateNaissance: moment(items.dateNaissance).format("YYYY-MM-DD"),
                email: items.email,
                sexe: items.sexe,
                avenue: items.avenue,
                quartier: items.quartier,
                commune: items.commune,
                fonction: items.fkFonction,
                pere: items.fkPere,
                mere: items.fkMere,
                conjoint: items.fkConjoint,
                baptise: items.isBaptise,
                egliseBaptise: items.egliseBaptise,
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

export const createMembre = async (req: request, res: response) => {
    let {
            nom,
            prenom,
            postnom,
            telephone,
            dateNaissance,
            email,
            sexe,
            avenue,
            quartier,
            commune,
            reference,
            fonction,
            mere,
            pere,
            conjoint,
            baptise,
            egliseBaptise,
            marie,
        } = req.body,
        { profil } = req.files,
        file: any = profil ? profil[0].filename : null,
        extension: any = file ? path.extname(file) : null,
        token: string = randomstring.generate(6),
        error = checkError(req.body, {
            nom: Joi.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
            prenom: Joi.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
            postnom: Joi.string().allow(""),
            dateNaissance: Joi.date(),
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
            fonction: Joi.allow(""),
            baptise: Joi.string(),
            egliseBaptise: Joi.string().allow(""),
            mere: Joi.allow(""),
            pere: Joi.allow(""),
            conjoint: Joi.allow(""),
            marie: Joi.allow(""),
            profil: Joi.string(),
        })

    if (error?.length) return res.status(400).json({ error })

    fonction = fonction == "undefined" ? null : fonction
    mere = mere == "undefined" ? null : mere
    pere = pere == "undefined" ? null : pere
    conjoint = conjoint == "undefined" ? null : conjoint
    marie = marie == "undefined" ? null : marie
    baptise = baptise == "true" ? true : false
    /* console.log(req.body) */
    try {
        if (
            !(await isFindColumn("membre", ["nom", "prenom", "postnom", "dateNaissance"], [nom, prenom, postnom, dateNaissance]))
        ) {
            if (file) fileCompresse(extension, profil[0])
            const membre = await createData(
                "membre",
                [
                    "nom",
                    "prenom",
                    "postnom",
                    "telephone",
                    "dateNaissance",
                    "email",
                    "sexe",
                    "avenue",
                    "quartier",
                    "commune",
                    "reference",
                    "fkfonction",
                    "fkmere",
                    "fkpere",
                    "fkconjoint",
                    "isBaptise",
                    "egliseBaptise",
                    "tkMembre",
                    "profil",
                ],
                ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"],
                [
                    nom,
                    prenom,
                    postnom,
                    telephone,
                    dateNaissance,
                    email,
                    sexe,
                    avenue,
                    quartier,
                    commune,
                    reference,
                    fonction,
                    mere,
                    pere,
                    conjoint,
                    baptise,
                    egliseBaptise,
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
export const updateMembre = async (req: request, res: response) => {
    const { id } = req.params
    let {
        nom,
        prenom,
        postnom,
        telephone,
        dateNaissance,
        email,
        sexe,
        avenue,
        quartier,
        commune,
        fonction,
        mere,
        pere,
        conjoint,
        baptise,
        idMembre,
    } = req.body
    const error = checkError(
        {
            nom,
            prenom,
            postnom,
            telephone,
            dateNaissance,
            email,
            sexe,
            avenue,
            quartier,
            commune,
            fonction,
            mere,
            pere,
            conjoint,
            baptise,
            idMembre,
        },
        {
            nom: Joi.string().min(3).message("Le nom doit avoir plus de 3 caracteres").required(),
            prenom: Joi.string().min(3).message("Le prenom doit avoir plus de 3 caracteres"),
            postnom: Joi.string().allow(""),
            dateNaissance: Joi.date(),
            email: Joi.string().email().message("Inserer un bon mail").allow(""),
            telephone: Joi.number(),
            sexe: Joi.string().max(1).message("Un seul caractere"),
            avenue: Joi.string(),
            quartier: Joi.string(),
            commune: Joi.string(),
            fonction: Joi.allow(""),
            baptise: Joi.number(),
            mere: Joi.allow(""),
            pere: Joi.allow(""),
            conjoint: Joi.allow(""),
            profil: Joi.string(),
            idMembre: Joi.number(),
        }
    )
    if (error?.length) {
        console.log(error)
        return res.status(400).json({ error })
    }

    fonction = fonction == "undefined" ? null : fonction
    mere = mere == "undefined" ? null : mere
    pere = pere == "undefined" ? null : pere
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
            if (membre[0].dateNaissance != dateNaissance) {
                const updateDateNaissance = await updateData("membre", ["dateNaissance"], ["tkMembre"], [dateNaissance, id])
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
            console.log(req.body.fonction)
            if (membre[0].fkFonction != fonction) {
                const updateFonction = await updateData("membre", ["fkFonction"], ["tkMembre"], [fonction, id])
                if (!updateFonction) error = true
            }
            if (membre[0].fkPere != pere) {
                const updatePere = await updateData("membre", ["fkPere"], ["tkMembre"], [pere, id])
                if (!updatePere) error = true
            }
            if (membre[0].fkMere != mere) {
                const updateMere = await updateData("membre", ["fkMere"], ["tkMembre"], [mere, id])
                if (!updateMere) error = true
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
                /* cancelTransaction() */
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            } else {
                /* commitTransaction() */
                return res.status(200).json({ message: "Modification réussi" })
            }
        } else res.status(400).json({ messsage: "Ce membre n'existe pas " })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const deleteMembre = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required(),
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        if (await isFindColumn("membre", ["tkMembres"], [id])) {
            if (await deleteData("membre", ["tkMembres"], [id])) {
                return res.status(200).json({ message: "Supression reussi" })
            }
        } else {
            return res.status(400).json({ message: "Ce membre n'existe pas" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
}
//recuperer les données par sexe pour remplir le select de Pere(M) et de Mere(M)
export const parentMembre = async (req: request, res: response) => {
    const { sexe } = req.params
    try {
        const parent: any[] = await fetchTableColumns("membre", ["sexe"], [sexe])
        if (parent.length) {
            const allParent = parent.map((items: any) => ({
                value: items.idMembre,
                label: `${items.nom} ${items.postnom} ${items.prenom}`,
            }))
            allParent.unshift({ value: "undefined", label: "sélectionner..." })
            return res.status(200).json(allParent)
        }
        return res.status(200).json([])
    } catch (error: any) {
        res.status(400).json({ message: error || "An error occurred" })
    }
}
//api pour afficher le marie et le celibataire
export const celibataireMembre = async (req: request, res: response) => {
    const { sexe } = req.params
    try {
        const celibataire: any[] = await fetchTableColumns("membre", ["sexe"], [sexe], "AND fkConjoint IS NULL")
        if (celibataire.length) {
            const allCelibataire = celibataire.map((items: any) => ({
                value: items.idMembre,
                label: `${items.nom} ${items.postnom} ${items.prenom}`,
            }))
            allCelibataire.unshift({ value: "undefined", label: "sélectionner..." })
            return res.status(200).json(allCelibataire)
        }
        return res.status(200).json([])
    } catch (error: any) {
        res.status(400).json({ message: error || "An error occurred" })
    }
}
