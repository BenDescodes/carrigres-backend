import connect from '../config/connect'
import Joi from "joi";
import { checkError, createData, ErrorMessage, fetchTableColumns, isFindColumn } from "../helper/method";
import { request, response, secret } from "../types/type";
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export const signup = async (req: request, res: response) => {
    const { username, mdp, role, membre, confMdp } = req.body,
        error = checkError(req.body, {
            username: Joi.string(),
            mdp: Joi.string(),
            confMdp: Joi.ref('mdp'),
            role: Joi.number()
        })
    /*  if (error) {
         const errors = error.details
         const listErrors: Array<any> = []
         for (let index = 0; index < errors.length; index++) {
             const element = errors[index]
             listErrors.push(element.message)
         }
         res.status(400).json({ code: 10, message: listErrors })
         return
     } */
    if (error) return res.status(400).json({ message: error[0]?.message })

    if (await isFindColumn('users', ['login'], [username])) {
        return res.status(400).json({
            message:
                'cet login est déjà pris, veuillez en créer un nouveau ou réinitialiser votre mot de passe',
        })
    }
    hash(mdp, 10, async (err: any, hash: any) => {
        if (err) return res.status(400).json({ message: 'erreur survenu lors du cryptage, veuillez reessayer plutard' })
        const createUser = await createData('users', ['login', 'mdp', 'fkROle', 'fkMembre'], ['?,?,?,?'], [username, hash, role, membre])
        if (createUser) res.status(200).json({ message: 'Enregistrement effectuer' })
        else res.status(400).json({ message: "Erreur survenu lors de l'enregistrement" })
        return
    })
}
export const login = async (req: request, res: response) => {
    const { username, mdp } = req.body,
        error = checkError(req.body, {
            username: Joi.string().required(),
            mdp: Joi.string().required()
        })
    if (error) return res.status(400).json({ message: error[0]?.message })

    const user: any = await fetchTableColumns('users', ['login'], [username])
    if (!user[0]) return res.status(403).json({ code: 13, message: ErrorMessage.erreurMdp })

    compare(mdp, user[0]?.mdp, (err: any, response: boolean) => {

        if (err) return res.status(400).json({ error: 403, message: ErrorMessage.erreurInscription })
        if (!response) return res.status(403).json({ code: 403, message: ErrorMessage.erreurMdp })
        const data = user[0]

        res.status(200).json({
            idUser: data.idUsers,
            login: data.login,
            /* nomComplet: data.nomComplet, */
            role: data.fkRole,
            token: sign({ idUser: data.idUsers }, secret, { expiresIn: '24h', }),
        })
    })
}