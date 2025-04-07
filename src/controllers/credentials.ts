import connect from "../config/connect"
import Joi from "joi"
import {
    checkError,
    createData,
    deleteData,
    ErrorMessage,
    fetchTableColumns,
    fetchTableData,
    isFindColumn,
    updateData,
} from "../helper/method"
import { secret } from "../types/type"
import { Request, Response } from "express"
import { compare, hash } from "bcrypt"
import { sign } from "jsonwebtoken"

export const signup = async (req: Request, res: Response) => {
    const { login, mdp, role, membre, confMdp } = req.body
    const error = checkError(req.body, {
        login: Joi.string().required().messages({ "any.only": "Le login  est obligatoire" }),
        mdp: Joi.string().required().messages({
            "string.empty": "Le mot de passe est obligatoire.",
        }),
        confMdp: Joi.string().required().valid(Joi.ref("mdp")).messages({
            "any.only": "Les deux mots de passe sont incohérents.",
            "string.empty": "La confirmation du mot de passe est obligatoire.",
        }),
        membre: Joi.number().required().messages({ "string.empty": "Selectionner membre" }),
        role: Joi.number().required().messages({ "string.empty": "Selectionner un role" }),
    })

    if (error) return res.status(400).json({ message: error[0]?.message })
    try {
        const findUser: any = isFindColumn("users", ["login", "fkMembre"], [login, membre])
        if (!findUser) return res.status(400).json({ message: "Cet utilisateur existe déjà" })
    } catch (error: any) {
        return res.status(400).json({ message: `Erreur ${error.message}` })
    }
    hash(mdp, 10, async (err: any, hash: any) => {
        if (err) return res.status(400).json({ message: "erreur survenu lors du cryptage, veuillez reessayer plutard" })
        try {
            const createUser = await createData(
                "users",
                ["login", "mdp", "fkROle", "fkMembre"],
                ["?,?,?,?"],
                [login, hash, role, membre]
            )
            if (createUser) res.status(200).json({ message: "Enregistrement effectuer" })
            else res.status(400).json({ message: "Erreur survenu lors de l'enregistrement" })
        } catch (error: any) {
            return res.status(400).json({ message: `Erreur ${error}` })
        }

        return
    })
}
export const login = async (req: Request, res: Response) => {
    const { login, mdp } = req.body,
        error = checkError(req.body, {
            login: Joi.string().required(),
            mdp: Joi.string().required(),
        })
    if (error) return res.status(400).json({ message: error[0]?.message })

    const user: any = await fetchTableColumns("v_membre_user", ["login"], [login])
    if (!user[0]) return res.status(403).json({ code: 13, message: ErrorMessage.erreurMdp })

    compare(mdp, user[0]?.mdp, (err: any, Response: boolean) => {
        if (err) return res.status(400).json({ error: 403, message: ErrorMessage.erreurInscription })
        if (!Response) return res.status(403).json({ code: 403, message: ErrorMessage.erreurMdp })
        const data = user[0]

        res.status(200).json({
            userData: {
                idUser: data.idUsers,
                login: data.login,
                profil: data.profil ? `${req.protocol}://${req.get("host")}/src/images/${data.profil}` : null,
                /* nomComplet: data.nomComplet, */
                idRole: data.idRole,
                role: data.role,
            },
            token: sign({ idUser: data.idUsers }, secret, { expiresIn: "2h" }),
        })
    })
}
export const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        const usersData: any[] = await fetchTableData("v_membre_user", "WHERE login != 'SuperAdmin' Order by idRole DESC")
        if (usersData.length) {
            let allUsers: any[] = []
            usersData.map((items: any) => {
                let data = {
                    idUsers: items.idUsers,
                    login: items.login,
                    nomComplet: `${items.nom} ${items.prenom}`,
                    role: items.role,
                    profil: items.profil ? `${req.protocol}://${req.get("host")}/src/images/${items.profil}` : null,
                }
                allUsers.push(data)
            })
            res.status(200).json(allUsers)
            return
        } else return []
    } catch (error) {
        res.status(400).json({ message: error })
    }
}
export const fetchOneUsers = async (req: Request, res: Response) => {
    const { id } = req.params
    const error = checkError(req.params, {
        id: Joi.required(),
    })
    if (error?.length) return res.status(400).json({ error })
    try {
        const OneUsersData: any[] = await fetchTableColumns("users", ["idUsers"], [id])
        if (OneUsersData.length) {
            const items: any = OneUsersData[0]
            let data = {
                idUsers: items.idUsers,
                login: items.login,
                membre: items.fkMembre,
                role: items.fkRole,
            }
            res.status(200).json(data)
            return
        } else return []
    } catch (error) {
        res.status(400).json({ message: error })
    }
}
export const fetchAllRole = async (req: Request, res: Response) => {
    try {
        const roleData: any[] = await fetchTableData("role", "Order by idRole DESC")
        if (roleData.length) {
            const allRole = roleData.map((items: any) => ({
                value: items.idRole,
                label: `${items.role}`,
            }))
            allRole.unshift({ value: "undefined", label: "Sélectionner role..." })
            res.status(200).json(allRole)
            return
        } else return []
    } catch (error) {
        res.status(400).json({ message: error })
    }
}
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { login, role, mdp, confMdp } = req.body
    const error = checkError(
        { login, role, mdp, confMdp },
        {
            login: Joi.string().required().messages({ "any.only": "Le login  est obligatoire" }),
            mdp: Joi.string().allow("").messages({
                "string.empty": "Le mot de passe est obligatoire.",
            }),
            confMdp: Joi.string().allow("").valid(Joi.ref("mdp")).messages({
                "any.only": "Les deux mots de passe sont incohérents.",
                "string.empty": "La confirmation du mot de passe est obligatoire.",
            }),
            role: Joi.number().required().messages({ "string.empty": "Selectionner un role" }),
        }
    )
    if (error?.length) return res.status(400).json(error)
    try {
        const users: any[] = await fetchTableColumns("users", ["idUsers"], [id])
        let error: boolean = false
        if (users.length) {
            if (users[0].login != login) {
                const updateLogin = await updateData("users", ["login"], ["idUsers"], [login, id])
                if (!updateLogin) error = true
            }
            if (users[0].fkRole != role) {
                const updateRole = await updateData("users", ["fkRole"], ["idUsers"], [role, id])
                if (!updateRole) error = true
            }
            if (mdp && confMdp) {
                hash(mdp, 10, async (err: any, hash: any) => {
                    if (err) {
                        return res.status(400).json({ message: "erreur survenu lors du cryptage, veuillez reessayer plutard" })
                    }
                    const updateMdp = await updateData("users", ["mdp"], ["idUsers"], [hash, id])
                    if (!updateMdp) error = true
                })
            } else {
                return res.status(200).json({ message: "Modification réussi sans le mot de passe" })
            }
            if (error) return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" })
            else return res.status(200).json({ message: "Modification réussi" })
        }
    } catch (error) {}
}
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params,
        error = checkError(req.params, {
            id: Joi.string().required(),
        })
    if (error?.length) return res.status(400).json({ error })
    if (await isFindColumn("users", ["idUsers"], [id])) {
        if (await deleteData("users", ["idUsers"], [id])) {
            return res.status(200).json({ message: "Supression reussi" })
        }
    } else {
        return res.status(400).json({ message: "Cet utilisateur n'existe pas" })
    }
}
