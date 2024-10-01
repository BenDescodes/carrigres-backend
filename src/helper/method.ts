import Joi from 'joi';
import connect from '../config/connect'

const fetchTableFields = (fields: Array<any>, clause?: boolean) => {
    const field = []
    for (let index = 0; index < fields.length; index++) {
        field.push(`${fields[index]} = ? `);
    }
    return field.join(clause ? ", " : " AND ")
}

export const isFindColumn = (table: string, fields: Array<any>, values: Array<any>, clause: string = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT COUNT(*) AS nb FROM " + table + " WHERE " + fetchTableFields(fields) + " " + clause;
        connect.query(script, values, (error, res) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res[0].nb > 0)
        })
    })
}

export const fetchTableColumns = (table: string, fields: Array<any>, values: Array<any>, clause: string = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT *  FROM " + table + " WHERE " + fetchTableFields(fields) + " " + clause;
        connect.query(script, values, (error, res: Array<any>) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res)
        })
    })
}

export const fetchTableData = (table: string, clause: string = "") => {
    return new Promise((resolve, reject) => {
        let script = "SELECT *  FROM " + table + " " + clause;
        connect.query(script, (error, res: Array<any>) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res)
        })
    })
}

export const createData = (table: string, columns: Array<any>, affect: Array<any>, value: Array<any>) => {
    return new Promise((resolve, reject) => {
        let script = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + affect.join(",") + ")";
        connect.query(script, value, (error, res: Array<any>) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res)
        })
    })
}

export const updateData = (table: string, columns: Array<any>, filter: Array<any>, values: Array<any>) => {
    return new Promise((resolve, reject) => {
        let script = "UPDATE " + table + " SET " + fetchTableFields(columns, true) + " WHERE " + fetchTableFields(filter);
        connect.query(script, values, (error, res: Array<any>) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res)
        })
    })
}

export const deleteData = (table: string, columns: Array<any>, values: Array<any>) => {
    return new Promise((resolve, reject) => {
        let script = "DELETE FROM  " + table + " WHERE " + fetchTableFields(columns);
        connect.query(script, values, (error, res: Array<any>) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(res)
        })
    })
}

export const checkError = (req: any, params: object) => {
    const schema = Joi.object(params)
    const { error } = schema.validate(req)
    if (error) {
        const errors = error.details
        const listErrors: Array<any> = []
        for (let index = 0; index < errors.length; index++) {
            const element = errors[index];
            listErrors.push({ field: element.context?.label, message: element.message })
        }
        return listErrors
    }

}


export const startTransaction = () => {
    return new Promise((resolve, reject) => {
        connect.query("START TRANSACTION", (error) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(true)
        })
    })
}

export const commitTransaction = () => {
    return new Promise((resolve, reject) => {
        connect.query("COMMIT", (error) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(true)
        })
    })
}

export const cancelTransaction = () => {
    return new Promise((resolve, reject) => {
        connect.query("ROLLBACK", (error) => {
            if (error) {
                reject({ "error": error })
                return
            }
            resolve(true)
        })
    })
}

export const ErrorMessage = {
    erreur500:
        'Erreur survenu lors la connexion veuillez réessayer plutard merci!',
    erreurMdp: "Mot de passe ou nom d'utilisateur incorrect",
    erreurInscription:
        'Erreur survenu lors de votre inscription veuillez réessayer plutard merci!',
    noAccess: "Vous  n'avez pas le droit d'effectuer cette operation",
    ajout: "erreur survenu lors de l'ajout",
    notFound: 'information non disponible',
    save: "Erreur survenu lors de l'enregistrement",
    edit: 'impossible de modifier une information indisponible',
    delete: 'Erreur survenu lors de la suppression',
}
export const successMessage = {
    save: 'Enregistrement réussi',
}