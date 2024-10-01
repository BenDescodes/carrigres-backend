import Joi from "joi";
import { request, response } from "../types/type";
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData, updateData } from '../helper/method'
import randomstring from 'randomstring'

export const fetchAllPred = async (req: request, res: response) => {
    try {
        const membres: Array = await fetchTableData("predicateur", 'ORDER by idPred DESC')
        if (membres.length) {
            let allPred: Array = []
            membres.map((items: any) => {
                let data = {
                    "id": items.idPred,
                    "titre": items.titre,
                    "nom": items.nomComplet,
                    "tel": items.tel,
                    "eglise": items.eglise,
                    "tkPred": items.tkPred
                }
                allPred.push(data)
            })
            return res.status(200).json(allPred)
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const fetchOnePred = async (req: request, res: response) => {
    const { id } = req.params
    const error = checkError(req.params, {
        id: Joi.required()
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const preds: Array = await fetchTableColumns("predicateur", ["tkPred"], [id]);
        if (preds?.length) {
            const currentPreds = preds[0]
            let data = {
                "id": currentPreds.idPred,
                "titre": currentPreds.titre,
                "nom": currentPreds.nomComplet,
                "eglise": currentPreds.eglise,
                "tel": currentPreds.tel,
                "tkPred": currentPreds.tkPred
            }
            return res.status(200).json(data)
        }
        return res.status(404).json({ message: "Predicateur non trouvé " })
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const createPred = async (req: request, res: response) => {
    const { nom, prenom, eglise, titre, tel } = req.body,
        token: string = randomstring.generate(15),
        error = checkError(req.body, {
            nom: Joi.string().required(),
            prenom: Joi.string().required(),
            tel: Joi.string().required(),
            eglise: Joi.string().required(),
            titre: Joi.string().allow('')
        })
    if (error?.length) return res.status(400).json(error)
    try {
        const nomComplet = nom + ' ' + prenom
        if (! await isFindColumn("predicateur", ["nomComplet", "eglise"], [nomComplet, eglise])) {
            const pred: Array = await createData('predicateur', ['titre', 'nomComplet', 'eglise', 'tkPred', 'tel'], ['?', '?', '?', '?', '?'], [titre, nomComplet, eglise, token, tel])
            if (pred) {
                return res.status(200).json({ message: 'Enregistrement effectué' })
            }
        } else return res.status(400).json({ message: 'Ce Predicateur est déjà enregistré' })

    } catch (error) {
        return res.status(400).json(error)
    }
}

export const updatePred = async (req: request, res: response) => {
    const { id } = req.params,
        { nomComplet, eglise, titre } = req.body,
        error = checkError(req.body, {
            nomComplet: Joi.string(),
            eglise: Joi.string(),
            titre: Joi.string()
        })
    if (error?.length) return res.status(400).json(error)
    try {
        const pred: Array = await fetchTableColumns("predicateur", ['idPred'], [id])
        let error: boolean = false
        if (pred.length) {
            if (pred[0].titre != titre && !titre) {
                const updateTitre = await updateData('predicateur', ['titre'], ['idPred'], [titre, id])
                if (!updateTitre) error = true
            }
            if (pred[0].nomComplet != nomComplet) {
                const updateNom = await updateData('predicateur', ['nomComplet'], ['idPred'], [nomComplet, id])
                if (!updateNom) error = true
            }
            if (pred[0].eglise != eglise) {
                const updateEglise = await updateData('predicateur', ['eglise'], ['idPred'], [eglise, id])
                if (!updateEglise) error = true
            }
            if (error) return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            else return res.status(200).json({ message: "Modification réussi" });
        } else return res.status(400).json({ message: "Ce predicateur n'existe pas" })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const deletePred = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required()
        })
    if (error?.length) return res.status(400).json({ error })
    if (await isFindColumn("predicateur", ["tkPred"], [id])) {
        if (await deleteData("predicateur", ["tkPred"], [id])) {
            return res.status(200).json({ message: "Supression reussi" })
        }
    } else { return res.status(400).json({ message: "Ce predicateur n'existe pas" }) }
}