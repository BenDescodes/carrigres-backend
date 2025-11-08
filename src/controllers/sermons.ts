import Joi from "joi"
import { Request, Response } from "express"
import { createData, fetchTableData, fetchTableColumns, isFindColumn, checkError, deleteData, updateData } from "../helper/method"
const { query } = require("../config/connect")
import randomstring from "randomstring"
import { fileCompresse } from "../middleware/multerConfig"
import dateFrancais from "../helper/dateConfig"
import moment from "moment"
moment.locale("fr")

export const fetchAllSermon = async (req: Request, res: Response) => {
    try {
        const sermon: any[] = await fetchTableData("v_sermon_all", "ORDER BY dateSermon DESC")
        if (!sermon.length) return res.status(200).json([])

        const allSermons = await Promise.all(
            sermon.map(async (items: any) => {
                const predicateur: string = items.nomPredicateur
                    ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                    : `${items.nom} ${items.prenom}`

                const eglise: string = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres"

                return {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: dateFrancais(items.dateSermon),
                    titre: items.titre ? items.titre : "",
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienFacebook2: items.lienFacebook2,
                    lienYoutube: items.lienYoutube,
                    vue: items.nbrVue,
                }
            })
        )
        return res.status(200).json(allSermons)
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const fetchOtherSermon = async (req: Request, res: Response) => {
    try {
        /* const script =
            "SELECT * FROM v_sermon_all WHERE nom!=? OR nom is null AND prenom!=? OR prenom is null ORDER BY dateSermon DESC" */
        const script = `
                        SELECT *
                        FROM v_sermon_all
                        WHERE (nom != ? OR nom IS NULL)
                        AND (prenom != ? OR prenom IS NULL)
                        ORDER BY dateSermon DESC
                        `
        const sermon: any[] = await query(script, ["Kapanga", "Theophile"])
        if (!sermon.length) return res.status(200).json([])

        const fullSermons = await Promise.all(
            sermon.map(async (items: any) => {
                const predicateur: string = items.nomPredicateur
                    ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                    : `${items.nom} ${items.prenom}`

                const eglise: string = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres"

                return {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: dateFrancais(items.dateSermon),
                    titre: items.titre ? items.titre : "Frère",
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienFacebook2: items.lienFacebook2,
                    lienYoutube: items.lienYoutube,
                    vue: items.nbrVue,
                }
            })
        )
        return res.status(200).json(fullSermons)
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const fetchOneSermon = async (req: Request, res: Response) => {
    const { id } = req.params
    const error = checkError(req.params, {
        id: Joi.required(),
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const sermon: any[] = await fetchTableColumns("v_sermon_all", ["IdSermon"], [id])
        if (!sermon.length) return res.status(200).json([])

        const items = sermon[0]

        const predicateur: string = items.nomPredicateur
            ? `${items.prenomPredicateur} ${items.nomPredicateur}`
            : `${items.prenom} ${items.nom}`

        const eglise: string = items.eglise || "Assemblée Chrétienne de Carrigres"

        const oneSermon = {
            id: items.idSermon,
            theme: items.theme,
            passage: items.passage,
            dateSermon: moment(items.dateSermon).format("YYYY-MM-DD"),
            dateSermonFront: dateFrancais(items.dateSermon),
            predicateur: predicateur,
            eglise: eglise,
            lienFacebook: items.lienFacebook,
            lienFacebook2: items.lienFacebook2,
            lienYoutube: items.lienYoutube,
            vue: items.nbrVue,
        }
        return res.status(200).json(oneSermon)
    } catch (error) {
        return res.status(400).json(error)
    }
    try {
        const sermon: any[] = await fetchTableColumns("v_sermon_all", ["IdSermon"], [id])

        if (!sermon.length) return res.status(200).json([])

        const [oneSermon] = await Promise.all([
            (async () => {
                const items = sermon[0]

                const predicateur: string = items.nomPredicateur
                    ? `${items.prenomPredicateur} ${items.nomPredicateur}`
                    : `${items.prenom} ${items.nom}`

                const eglise: string = items.eglise || "Assemblée Chrétienne de Carrigres"

                return {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: moment(items.dateSermon).format("YYYY-MM-DD"),
                    dateSermonFront: dateFrancais(items.dateSermon),
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienFacebook2: items.lienFacebook2,
                    lienYoutube: items.lienYoutube,
                    vue: items.nbrVue,
                }
            })(),
        ])

        return res.status(200).json(oneSermon)
    } catch (error) {
        return res.status(400).json({ error: error.message || error })
    }
}

export const fetchAllSermonPasteur = async (req: Request, res: Response) => {
    try {
        const sermon: any[] = await fetchTableColumns(
            "v_sermon_all",
            ["nom", "prenom"],
            ["Kapanga", "Theophile"],
            "ORDER by dateSermon DESC"
        )
        if (!sermon.length) return res.status(200).json([])

        const fullSermons = await Promise.all(
            sermon.map(async (items: any) => {
                const predicateur: string = items.nomPredicateur
                    ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                    : `${items.nom} ${items.prenom}`

                const eglise: string = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres"

                return {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: dateFrancais(items.dateSermon),
                    titre: "Pasteur",
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienFacebook2: items.lienFacebook2,
                    lienYoutube: items.lienYoutube,
                    vue: items.nbrVue,
                }
            })
        )
        return res.status(200).json(fullSermons)
    } catch (error) {
        return res.status(400).json(error)
    }
}

export const createSermon = async (req: Request, res: Response) => {
    const { theme, passage, date, lienFacebook, lienYoutube, lienFacebook2, predicateur } = req.body,
        token: string = randomstring.generate(6),
        error = checkError(req.body, {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            date: Joi.date().required(),
            lienFacebook: Joi.allow(""),
            lienYoutube: Joi.allow(""),
            lienFacebook2: Joi.allow(""),
            predicateur: Joi.string(),
        })
    if (error?.length) return res.status(400).json(error)
    try {
        if (!(await isFindColumn("sermon", ["theme", "passage", "dateSermon"], [theme, passage, date]))) {
            const dataMembre: any[] = await fetchTableColumns("membre", ["tkMembre"], [predicateur])
            const dataPredicateur: any[] = await fetchTableColumns("predicateur", ["tkPred"], [predicateur])
            const fkPred = dataMembre.length ? dataMembre[0].tkMembre : dataPredicateur.length ? dataPredicateur[0].tkPred : null
            const sermon = await createData(
                "sermon",
                ["theme", "passage", "dateSermon", "lienFacebook", "lienYoutube", "lienFacebook2", "tkSermon", "fkPredicateur"],
                [theme, passage, date, lienFacebook, lienYoutube, lienFacebook2, token, fkPred]
            )
            if (sermon) return res.status(200).json({ message: "Enregistrement effectué" })
        } else return res.status(400).json({ message: "Cette Predication est déjà enregistré" })
    } catch (error) {
        return res.status(400).json(error)
    }
}
export const updateSermon = async (req: Request, res: Response) => {
    const { id } = req.params
    const { theme, passage, dateSermon, lienFacebook2, lienFacebook, lienYoutube, predicateur } = req.body
    const error = checkError(
        { theme, passage, dateSermon, lienFacebook2, lienFacebook, lienYoutube, predicateur },
        {
            theme: Joi.string().required(),
            passage: Joi.string().required(),
            dateSermon: Joi.date().required(),
            lienFacebook: Joi.string().allow(""),
            lienYoutube: Joi.string().allow(""),
            lienFacebook2: Joi.string().allow(""),
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
            if (sermon[0].lienFacebook2 != lienFacebook2) {
                const updateVideo2 = await updateData("sermon", ["lienFacebook2"], ["idSermon"], [lienFacebook2, id])
                if (!updateVideo2) error = true
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
export const deleteSermon = async (req: Request, res: Response) => {
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
