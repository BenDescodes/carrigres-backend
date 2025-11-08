import { countTableData } from "../helper/method"
import { Request, Response } from "express"

export const dashboard = async (req: Request, res: Response) => {
    try {
        const membre = await countTableData("membre")
        const predicateur = await countTableData("predicateur")
        const sermon = await countTableData("sermon")
        res.status(200).json({ membre: membre, predVisiteur: predicateur, sermon: sermon })
    } catch (error) {
        return res.status(400).json(error)
    }
}
