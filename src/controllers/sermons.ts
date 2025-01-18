import Joi from "joi"
import { request, response } from "../types/type"
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData, updateData } from "../helper/method"
import randomstring from "randomstring"
import path from "path"
import { fileCompresse } from "../middleware/multerConfig"
import dateFrancais from "../helper/dateConfig"
import moment from "moment"
moment.locale("fr")

export const fetchAllSermon = async (req: request, res: response) => {
    try {
        const sermon: any[] = await fetchTableData("sermon", " ORDER BY dateSermon DESC")
        if (sermon.length) {
            let allSermon
            const fullSermons = await Promise.all(
                sermon.map(async (items: any) => {
                    const [dataM, dataP]: [any[], any[]] = await Promise.all([
                        fetchTableColumns("membre", ["tkMembre"], [items.fkPredicateur]),
                        fetchTableColumns("predicateur", ["tkPred"], [items.fkPredicateur]),
                    ])

                    const predicateur: string | null = dataM.length
                        ? `${dataM[0].nom} ${dataM[0].prenom}`
                        : dataP.length
                        ? `${dataP[0].prenom} ${dataP[0].nom}`
                        : null

                    const eglise: string = dataP.length ? dataP[0].eglise : "Assemblée Chrétienne de Carrigres"

                    return {
                        id: items.idSermon,
                        theme: items.theme,
                        passage: items.passage,
                        dateSermon: dateFrancais(items.dateSermon),
                        titre: dataP[0].titre,
                        predicateur: predicateur,
                        eglise: eglise,
                        lienFacebook: items.lienFacebook,
                        lienYoutube: items.lienYoutube,
                        lienAudio: items.lienAudio,
                        vue: items.nbrVue,
                    }
                })
            )
            return res.status(200).json(fullSermons)
        } else return []
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const fetchOneSermon = async (req: request, res: response) => {
    const { id } = req.params
    const error = checkError(req.params, {
        id: Joi.required(),
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const sermon: any[] = await fetchTableColumns("sermon", ["IdSermon"], [id])
        if (sermon) {
            const fullSermons = await Promise.all(
                sermon.map(async (items: any) => {
                    const [dataM, dataP]: [any[], any[]] = await Promise.all([
                        fetchTableColumns("membre", ["tkMembre"], [items.fkPredicateur]),
                        fetchTableColumns("predicateur", ["tkPred"], [items.fkPredicateur]),
                    ])

                    const predicateur: string | null = dataM.length
                        ? `${dataM[0].nom} ${dataM[0].prenom}`
                        : dataP.length
                        ? `${dataP[0].prenom} ${dataP[0].nom}`
                        : null

                    const eglise: string = dataP.length ? dataP[0].eglise : "Assemblée Chrétienne de Carrigres"

                    let data = {
                        id: items.idSermon,
                        theme: items.theme,
                        passage: items.passage,
                        dateSermon: moment(items.dateSermon).format("YYYY-MM-DD"),
                        dateSermonFront: dateFrancais(items.dateSermon),
                        predicateur: predicateur,
                        eglise: eglise,
                        lienFacebook: items.lienFacebook,
                        lienYoutube: items.lienYoutube,
                        lienAudio: items.lienAudio,
                        /* "image": items.imageSermon ? `${req.protocol}://${req.get('host')}/src/images/${items.imageSermon}` : null, */
                        vue: items.nbrVue,
                    }
                    return data
                })
            )
            return res.status(200).json(fullSermons[0])
        }
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const createSermon = async (req: request, res: response) => {
    const { theme, passage, date, lienFacebook, lienYoutube, lienAudio, predicateur } = req.body,
        token: string = randomstring.generate(6),
        error = checkError(req.body, {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            date: Joi.date().required(),
            lienFacebook: Joi.allow(""),
            lienYoutube: Joi.allow(""),
            lienAudio: Joi.allow(""),
            predicateur: Joi.string(),
        })
    if (error?.length) return res.status(400).json(error)
    try {
        if (!(await isFindColumn("sermon", ["theme", "passage", "dateSermon"], [theme, passage, date]))) {
            const dataMembre = await fetchTableColumns("membre", ["tkMembre"], [predicateur])
            const dataPredicateur = await fetchTableColumns("predicateur", ["tkPred"], [predicateur])
            const fkPred = dataMembre.length ? dataMembre[0].tkMembre : dataPredicateur.length ? dataPredicateur[0].tkPred : null
            const sermon = await createData(
                "sermon",
                ["theme", "passage", "dateSermon", "lienFacebook", "lienYoutube", "lienAudio", "tkSermon", "fkPredicateur"],
                ["?", "?", "?", "?", "?", "?", "?", "?"],
                [theme, passage, date, lienFacebook, lienYoutube, lienAudio, token, fkPred]
            )
            if (sermon) return res.status(200).json({ message: "Enregistrement effectué" })
        } else return res.status(400).json({ message: "Cette Predication est déjà enregistré" })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const updateSermon = async (req: request, res: response) => {
    const { id } = req.params
    const { theme, passage, dateSermon, lienAudio, lienFacebook, lienYoutube, predicateur } = req.body
    const error = checkError(
        { theme, passage, dateSermon, lienAudio, lienFacebook, lienYoutube, predicateur },
        {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            dateSermon: Joi.date().required(),
            lienFacebook: Joi.string().allow(""),
            lienYoutube: Joi.string().allow(""),
            lienAudio: Joi.string().allow(""),
            predicateur: Joi.string(),
        }
    )
    if (error?.length) return res.status(400).json(error)
    try {
        const sermon: any[] = await fetchTableColumns("sermon", ["idSermon"], [id])
        let error: boolean = false
        if (sermon.length) {
            if (sermon[0].theme != theme) {
                const updateNom = await updateData("sermon", ["theme"], ["idSermon"], [theme, id])
                if (!updateNom) error = true
            }
            if (sermon[0].passage != passage) {
                const updatePassage = await updateData("sermon", ["passage"], ["idSermon"], [passage, id])
                if (!updatePassage) error = true
            }
            if (sermon[0].date != dateSermon) {
                const updateDate = await updateData("sermon", ["dateSermon"], ["idSermon"], [dateSermon, id])
                if (!updateDate) error = true
            }
            if (sermon[0].lienFacebook != lienFacebook) {
                const updateVideo = await updateData("sermon", ["lienFacebook"], ["idSermon"], [lienFacebook, id])
                if (!updateVideo) error = true
            }
            if (sermon[0].lienYoutube != lienYoutube) {
                const updateVideo = await updateData("sermon", ["lienYoutube"], ["idSermon"], [lienYoutube, id])
                if (!updateVideo) error = true
            }
            if (sermon[0].lienAudio != lienAudio) {
                const updateAudio = await updateData("sermon", ["lienAudio"], ["idSermon"], [lienAudio, id])
                if (!updateAudio) error = true
            }

            if (sermon[0].fkPredicateur != predicateur) {
                const updatePred = await updateData("sermon", ["fkPredicateur"], ["idSermon"], [predicateur, id])
                if (!updatePred) error = true
            }
            if (error) return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            else return res.status(200).json({ message: "Modification réussi" })
        } else return res.status(400).json({ message: "Ce predicateur n'existe pas" })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const deleteSermon = async (req: request, res: response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required(),
        })
    if (error?.length) return res.status(400).json({ error })
    if (await isFindColumn("sermon", ["idSermon"], [id])) {
        if (await deleteData("sermon", ["idSermon"], [id])) {
            return res.status(200).json({ message: "Supression reussi" })
        }
    } else {
        return res.status(400).json({ message: "Cette predication n'existe pas" })
    }
}
