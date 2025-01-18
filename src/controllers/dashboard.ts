import { countTableData, fetchTableData, isFindColumn } from "../helper/method"
import { request, response } from "../types/type"

export const dashboard = async (req: request, res: response) => {
    try {
        const membre: any[] = await countTableData("membre")
        const predicateur: any[] = await countTableData("predicateur")
        const sermon: any[] = await countTableData("sermon")
        res.status(200).json({ membre: membre[0].count, predVisiteur: predicateur[0].count, sermon: sermon[0].count })
    } catch (error) {
        return res.status(400).json(error)
    }
}
