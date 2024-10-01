import { NextFunction, Request, Response } from "express-serve-static-core"
import QueryString from "qs"

export type request = Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>
export type response = Response<any, Record<string, any>, number>
export type next = NextFunction 

export const secret = "ooikwe2pBevO2arVAJoadf7$2b$10$YXAin722W8mlpbpDaCsZ";