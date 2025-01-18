import { fetchTableColumns, fetchTableData } from "../helper/method"
import { request, response } from "../types/type"

export const fetchAllFonction = async (req: request, res: response) => {
    try {
        const fonctions: any[] = await fetchTableData("fonction", "Order by idFonction")
        if (fonctions.length) {
            const allFonction = fonctions.map((items: any) => ({
                value: items.IdFonction,
                label: `${items.fonction}`,
            }))
            allFonction.unshift({ value: "undefined", label: "sélectionner..." })
            res.status(200).json(allFonction)
        }
    } catch (error: any) {
        console.log({ message: error.message })
    }
}
