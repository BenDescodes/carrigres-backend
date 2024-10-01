import { verify } from 'jsonwebtoken'
import { next, response, secret } from '../types/type'
import connect from '../config/connect'
import { MysqlError } from 'mysql'

export const auth = (req: any, res: response, next: next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const decodeToken: any = verify(token, secret)
        req.auth = {
            idUser: decodeToken.idUser,
        }
        next()
    } catch (error) {
        res
            .status(500)
            .json({ message: "vous avez pas le droit d'effectuer cette action" })
    }
}