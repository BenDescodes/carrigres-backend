import Joi from "joi";
import { request, response } from "../types/type";
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData, updateData } from '../helper/method'
import randomstring from 'randomstring';
import path from "path";
import { fileCompresse } from "../middleware/multerConfig";
import dateFrancais from "../helper/dateConfig";

export const fetchAllSermon = async (req: request, res: response) => {
    try {
        const membres: Array = await fetchTableData("sermon", ' ORDER BY dateSermon DESC')
        if (membres.length) {
            let allSermon: object = {}
            const fullSermons = await Promise.all(membres.map(async (items: any) => {
                const dataM: Array = await fetchTableColumns('membre', ['tkMembre'], [items.fkPredicateur]),
                    dataP: Array = await fetchTableColumns('predicateur', ['tkPred'], [items.fkPredicateur]),
                    predicateur: any = dataM.length ? dataM[0].nom + ' ' + dataM[0].prenom : dataP.length ? dataP[0].nomComplet : null,
                    eglise = dataP.length ? dataP[0].eglise : 'Assemblée Chretienne de Carrigres'
                let data = {
                    "id": items.idSermon,
                    "theme": items.theme,
                    "passage": items.passage,
                    "dateSermon": dateFrancais(items.dateSermon),
                    "predicateur": predicateur,
                    "eglise": eglise,
                    "lienFacebbok": items.lienFacebook,
                    "lienYoutube": items.lienYoutube,
                    "lienAudio": items.lienAudio,
                    /* "image": items.imageSermon ? `${req.protocol}://${req.get('host')}/src/images/${items.imageSermon}` : null, */
                    "vue": items.nbrVue
                }
                allSermon = data

                return allSermon
            }))
            return res.status(200).json(fullSermons)
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const fetchOneSermon = async (req: request, res: response) => {
    const { id } = req.params
    const error = checkError(req.params, {
        id: Joi.required()
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const membres: Array = await fetchTableColumns("sermon", ["IdSermon"], [id]);
        if (membres) {
            const fullSermons = await Promise.all(membres.map(async (items: any) => {
                const dataM: Array = await fetchTableColumns('membre', ['tkMembre'], [items.fkPredicateur]),
                    dataP: Array = await fetchTableColumns('predicateur', ['tkPred'], [items.fkPredicateur]),
                    predicateur: any = dataM.length ? dataM[0].nom + ' ' + dataM[0].prenom : dataP.length ? dataP[0].nomComplet : null,
                    eglise = dataP.length ? dataP[0].eglise : 'Assemblée Chretienne de Carrigres'

                let data = {
                    "id": items.idSermon,
                    "theme": items.theme,
                    "passage": items.passage,
                    "dateSermon": dateFrancais(items.dateSermon),
                    "predicateur": predicateur,
                    "eglise": eglise,
                    "lienFacebbok": items.lienFacebook,
                    "lienYoutube": items.lienYoutube,
                    "lienAudio": items.lienAudio,
                    /* "image": items.imageSermon ? `${req.protocol}://${req.get('host')}/src/images/${items.imageSermon}` : null, */
                    "vue": items.nbrVue
                }
                return data
            }))
            return res.status(200).json(fullSermons)
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const createSermon = async (req: request, res: response) => {
    const { theme, passage, date, lienFacebook, lienYoutube, lienAudio, predicateur } = req.body,
        token: string = randomstring.generate(15),
        /* image: string = imageSermon[0] ? imageSermon[0].filename : null,
        extension: any = image ? path.extname(image) : null, */
        error = checkError(req.body, {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            date: Joi.date().required(),
            lienFacebook: Joi.string().allow(""),
            lienYoutube: Joi.string().allow(""),
            lienAudio: Joi.string().allow(""),
            predicateur: Joi.string()
        })
    if (error?.length) return res.status(400).json(error)
    try {
        if (! await isFindColumn("sermon", ["theme", "passage", "dateSermon"], [theme, passage, date])) {
            const dataM = await fetchTableColumns('membre', ['tkMembre'], [predicateur]),
                dataP = await fetchTableColumns('predicateur', ['tkPred'], [predicateur])
            const fkPred = dataM.length ? dataM[0].tkMembre : dataP.length ? dataP[0].tkPred : null
            /* if (image) fileCompresse(extension, imageSermon[0]) */
            const sermon = await createData('sermon', ['theme', 'passage', 'dateSermon', 'lienFacebook', 'lienYoutube', 'lienAudio', 'tkSermon', 'fkPredicateur'], ['?', '?', '?', '?', '?', '?', '?', '?'], [theme, passage, date, lienFacebook, lienYoutube, lienAudio, token, fkPred])
            if (sermon) {
                return res.status(200).json({ message: 'Enregistrement effectué' })
            }
        } else return res.status(400).json({ message: 'Cette Predication est déjà enregistré' })

    } catch (error) {
        return res.status(400).json(error)
    }
}
export const updateSermon = async (req: request, res: response) => {
    const { id } = req.params,
        { theme, passage, date, lienAudio, lienFacebook, lienYoutube, fkPredicateur } = req.body,
        error = checkError(req.body, {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            date: Joi.date().iso().required(),
            lienFacebook: Joi.string().allow(""),
            lienYoutube: Joi.string().allow(""),
            lienAudio: Joi.string().allow(""),
            fkPredicateur: Joi.string()
        })
    if (error?.length) return res.status(400).json(error)
    try {
        const sermon: Array = await fetchTableColumns("sermon", ['idSermon'], [id])
        let error: boolean = false
        if (sermon.length) {
            if (sermon[0].theme != theme) {
                const updateNom = await updateData('sermon', ['theme'], ['idSermon'], [theme, id])
                if (!updateNom) error = true
            }
            if (sermon[0].passage != passage) {
                const updatePassage = await updateData('sermon', ['passage'], ['idSermon'], [passage, id])
                if (!updatePassage) error = true
            }
            if (sermon[0].date != date) {
                const updateDate = await updateData('sermon', ['dateSermon'], ['idSermon'], [date, id])
                if (!updateDate) error = true
            }
            if (sermon[0].lienFacebook != lienFacebook) {
                const updateVideo = await updateData('sermon', ['lienFacebook'], ['idSermon'], [lienFacebook, id])
                if (!updateVideo) error = true
            }
            if (sermon[0].lienYoutube != lienYoutube) {
                const updateVideo = await updateData('sermon', ['lienYoutube'], ['idSermon'], [lienYoutube, id])
                if (!updateVideo) error = true
            }
            if (sermon[0].lienAudio != lienAudio) {
                const updateAudio = await updateData('sermon', ['lienAudio'], ['idSermon'], [lienAudio, id])
                if (!updateAudio) error = true
            }

            if (sermon[0].fkPredicateur != fkPredicateur) {
                const updatePred = await updateData('sermon', ['fkPredicateur'], ['idSermon'], [fkPredicateur, id])
                if (!updatePred) error = true
            }
            if (error) return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            else return res.status(200).json({ message: "Modification réussi" });

        } else return res.status(400).json({ message: "Ce predicateur n'existe pas" })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const deleteSermon = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required()
        })
    if (error?.length) return res.status(400).json({ error })
    if (await isFindColumn("sermon", ["idSermon"], [id])) {
        if (await deleteData("sermon", ["idSermon"], [id])) {
            return res.status(200).json({ message: "Supression reussi" })
        }
    } else { return res.status(400).json({ message: "Cette predication n'existe pas" }) }
}