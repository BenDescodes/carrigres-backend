import Joi from "joi";
import { request, response } from "../types/type";
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData } from '../helper/method'
import { fileCompresse } from "../middleware/multerConfig";
import randomstring from 'randomstring';
import path from "path";
import moment from "moment";
moment.locale('fr')

export const fetchAllMembre = async (req: request, res: response) => {
    try {
        const membres: Array = await fetchTableData("membre", 'ORDER by idMembre')
        if (membres) {
            let allMembre: Array = []
            membres.map((items: any) => {
                let data = {
                    "idMembre": items.idMembre,
                    "nom": items.nom,
                    "prenom": items.prenom,
                    "postnom": items.postnom,
                    "telephone": items.telephone,
                    "dateNaissance": moment(items.dateNaissance).format('LL'),
                    "email": items.email,
                    "sexe": items.sexe,
                    "avenue": items.avenue,
                    "quartier": items.quartier,
                    "commune": items.commune,
                    "fonction": items.fkFonction,
                    "pere": items.fkPere,
                    "mere": items.fkMere,
                    "conjoint": items.fkConjoint,
                    "batise": items.isBatise,
                    "decede": items.idDecede,
                    "dateDecede": items.dateDecede,
                    "profil": items.profil ? `${req.protocol}://${req.get('host')}/src/images/${items.profil}` : null,
                    "tkMembre": items.tkMembre
                }
                allMembre.push(data)
            })
            return res.status(200).json(allMembre)
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const fetchOneMembre = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.required()
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        const membres: Array = await fetchTableColumns("membre", ["tkMembres"], [id]);
        membres.map((items: any) => {
            const data = {
                "idMembre": items.idMembre,
                "nom": items.nom,
                "prenom": items.prenom,
                "postnom": items.postnom,
                "telephone": items.telephone,
                "dateNaissance": moment(items.dateNaissance).format('LL'),
                "email": items.email,
                "sexe": items.sexe,
                "avenue": items.avenue,
                "quartier": items.quartier,
                "commune": items.commune,
                "fonction": items.fkFonction,
                "pere": items.fkPere,
                "mere": items.fkMere,
                "conjoint": items.fkConjoint,
                "batise": items.isBatise,
                "decede": items.idDecede,
                "dateDecede": items.dateDecede,
                "profil": items.profil ? `${req.protocol}://${req.get('host')}/src/images/${items.profil}` : null,
                "tkMembre": items.tkMembre
            }
            return res.status(200).json(data)
        })
    } catch (error) {
        return res.status(404).json(error)
    }
}

export const createMembre = async (req: request, res: response) => {
    console.log(req.body, req.files)
    const { nom, prenom, postnom, telephone, dateNaissance, email, sexe, avenue, quartier, commune, fonction, mere, pere, conjoint, baptise, marie } = req.body,
        { profil } = req.files,
        file: any = req.file ? profil[0].filename : null,
        extension: any = file ? path.extname(file) : null,
        token: string = randomstring.generate(15),
        error = checkError(req.body, {
            nom: Joi.string().min(3).message('Le nom doit avoir plus de 3 caracteres').required(),
            prenom: Joi.string().min(3).message('Le prenom doit avoir plus de 3 caracteres'),
            postnom: Joi.string().min(3).message('Le postnom doit avoir plus de 3 caracteres'),
            dateNaissance: Joi.date(),
            email: Joi.string().email(),
            telephone: Joi.number(),
            sexe: Joi.string().max(1).message('Un seul caractere'),
            avenue: Joi.string(),
            quartier: Joi.string(),
            commune: Joi.string(),
            fonction: Joi.number().allow(''),
            baptise: Joi.string(),
            mere: Joi.number(),
            pere: Joi.number(),
            conjoint: Joi.number(),
            marie: Joi.string(),
            profil: Joi.string()
        })
    /* console.log(req.body, req.files) */
    if (error?.length) return res.status(400).json({ error })

    try {
        if (!await isFindColumn("membre", ['nom', 'prenom', 'postnom', 'dateNaissance'], [nom, prenom, postnom, dateNaissance])) {
            if (file) fileCompresse(extension, profil[0]) /* const file = 'null' */
            const membre = await createData('membre', ["nom", "prenom", "postnom", "telephone", "dateNaissance", "email", "sexe", "avenue", "quartier", "commune", "fkfonction", "fkmere", "fkpere", 'fkconjoint', "isbatise", "tkMembre", "profil"], ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'], [nom, prenom, postnom, telephone, dateNaissance, email, sexe, avenue, quartier, commune, fonction, mere, pere, conjoint, baptise, token, file])
            if (membre) res.status(200).json({ message: "Enregistrement effectué" })
            else res.status(400).json({ success: 0, message: "Erreur survenu lors de l'enregistrement" })
            return
        } else res.status(400).json({ message: 'Cet utilisateur existe déjà' })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const updateMembre = async (req: request, res: response) => {

}
export const deleteMembre = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required()
        })
    if (error?.length) return res.status(400).json({ error })
    try {
        if (await isFindColumn("membre", ["tkMembres"], [id])) {
            if (await deleteData("membre", ["tkMembres"], [id])) {
                return res.status(200).json({ message: "Supression reussi" })
            }
        } else { return res.status(400).json({ message: "Ce membre n'existe pas" }) }
    } catch (error) {
        res.status(400).json(error)
    }

}