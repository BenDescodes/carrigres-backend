import { NextFunction } from "express-serve-static-core"

export type next = NextFunction

export const secret = "ooikwe2pBevO2arVAJoadf7$2b$10$YXAin722W8mlpbpDaCsZ"

export type PredicateurType = {
    id: string
    titre: string
    nom: string
    prenom: string
    tel: string
    eglise: string
    tkPred: string
}
