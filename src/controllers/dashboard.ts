import { countTableData } from "../helper/method"
import { Request, Response } from "express"

export const dashboard = async (req: Request, res: Response) => {
    try {
        const membre: any[] = await countTableData("membre")
        const predicateur: any[] = await countTableData("predicateur")
        const sermon: any[] = await countTableData("sermon")
        res.status(200).json({ membre: membre[0].count, predVisiteur: predicateur[0].count, sermon: sermon[0].count })
    } catch (error) {
        return res.status(400).json(error)
    }
}
