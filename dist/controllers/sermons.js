"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSermon = exports.updateSermon = exports.createSermon = exports.fetchOneSermon = exports.fetchAllSermon = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const randomstring_1 = __importDefault(require("randomstring"));
const dateConfig_1 = __importDefault(require("../helper/dateConfig"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale("fr");
const fetchAllSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sermon = yield (0, method_1.fetchTableData)("sermon", " ORDER BY dateSermon DESC");
        if (sermon.length) {
            let allSermon;
            const fullSermons = yield Promise.all(sermon.map((items) => __awaiter(void 0, void 0, void 0, function* () {
                const [dataM, dataP] = yield Promise.all([
                    (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [items.fkPredicateur]),
                    (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [items.fkPredicateur]),
                ]);
                const predicateur = dataM.length
                    ? `${dataM[0].nom} ${dataM[0].prenom}`
                    : dataP.length
                        ? `${dataP[0].prenom} ${dataP[0].nom}`
                        : null;
                const eglise = dataP.length ? dataP[0].eglise : "Assemblée Chrétienne de Carrigres";
                return {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: (0, dateConfig_1.default)(items.dateSermon),
                    titre: dataP[0].titre,
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienYoutube: items.lienYoutube,
                    lienAudio: items.lienAudio,
                    vue: items.nbrVue,
                };
            })));
            return res.status(200).json(fullSermons);
        }
        else
            return [];
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchAllSermon = fetchAllSermon;
const fetchOneSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const sermon = yield (0, method_1.fetchTableColumns)("sermon", ["IdSermon"], [id]);
        if (sermon) {
            const fullSermons = yield Promise.all(sermon.map((items) => __awaiter(void 0, void 0, void 0, function* () {
                const [dataM, dataP] = yield Promise.all([
                    (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [items.fkPredicateur]),
                    (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [items.fkPredicateur]),
                ]);
                const predicateur = dataM.length
                    ? `${dataM[0].nom} ${dataM[0].prenom}`
                    : dataP.length
                        ? `${dataP[0].prenom} ${dataP[0].nom}`
                        : null;
                const eglise = dataP.length ? dataP[0].eglise : "Assemblée Chrétienne de Carrigres";
                let data = {
                    id: items.idSermon,
                    theme: items.theme,
                    passage: items.passage,
                    dateSermon: (0, moment_1.default)(items.dateSermon).format("YYYY-MM-DD"),
                    dateSermonFront: (0, dateConfig_1.default)(items.dateSermon),
                    predicateur: predicateur,
                    eglise: eglise,
                    lienFacebook: items.lienFacebook,
                    lienYoutube: items.lienYoutube,
                    lienAudio: items.lienAudio,
                    /* "image": items.imageSermon ? `${req.protocol}://${req.get('host')}/src/images/${items.imageSermon}` : null, */
                    vue: items.nbrVue,
                };
                return data;
            })));
            return res.status(200).json(fullSermons[0]);
        }
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchOneSermon = fetchOneSermon;
const createSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { theme, passage, date, lienFacebook, lienYoutube, lienAudio, predicateur } = req.body, token = randomstring_1.default.generate(6), error = (0, method_1.checkError)(req.body, {
        theme: joi_1.default.string().required(),
        passage: joi_1.default.string().required(),
        date: joi_1.default.date().required(),
        lienFacebook: joi_1.default.allow(""),
        lienYoutube: joi_1.default.allow(""),
        lienAudio: joi_1.default.allow(""),
        predicateur: joi_1.default.string(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json(error);
    try {
        if (!(yield (0, method_1.isFindColumn)("sermon", ["theme", "passage", "dateSermon"], [theme, passage, date]))) {
            const dataMembre = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [predicateur]);
            const dataPredicateur = yield (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [predicateur]);
            const fkPred = dataMembre.length ? dataMembre[0].tkMembre : dataPredicateur.length ? dataPredicateur[0].tkPred : null;
            const sermon = yield (0, method_1.createData)("sermon", ["theme", "passage", "dateSermon", "lienFacebook", "lienYoutube", "lienAudio", "tkSermon", "fkPredicateur"], ["?", "?", "?", "?", "?", "?", "?", "?"], [theme, passage, date, lienFacebook, lienYoutube, lienAudio, token, fkPred]);
            if (sermon)
                return res.status(200).json({ message: "Enregistrement effectué" });
        }
        else
            return res.status(400).json({ message: "Cette Predication est déjà enregistré" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.createSermon = createSermon;
const updateSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { theme, passage, dateSermon, lienAudio, lienFacebook, lienYoutube, predicateur } = req.body;
    const error = (0, method_1.checkError)({ theme, passage, dateSermon, lienAudio, lienFacebook, lienYoutube, predicateur }, {
        theme: joi_1.default.string().required(),
        passage: joi_1.default.string().required(),
        dateSermon: joi_1.default.date().required(),
        lienFacebook: joi_1.default.string().allow(""),
        lienYoutube: joi_1.default.string().allow(""),
        lienAudio: joi_1.default.string().allow(""),
        predicateur: joi_1.default.string(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json(error);
    try {
        const sermon = yield (0, method_1.fetchTableColumns)("sermon", ["idSermon"], [id]);
        let error = false;
        if (sermon.length) {
            if (sermon[0].theme != theme) {
                const updateNom = yield (0, method_1.updateData)("sermon", ["theme"], ["idSermon"], [theme, id]);
                if (!updateNom)
                    error = true;
            }
            if (sermon[0].passage != passage) {
                const updatePassage = yield (0, method_1.updateData)("sermon", ["passage"], ["idSermon"], [passage, id]);
                if (!updatePassage)
                    error = true;
            }
            if (sermon[0].date != dateSermon) {
                const updateDate = yield (0, method_1.updateData)("sermon", ["dateSermon"], ["idSermon"], [dateSermon, id]);
                if (!updateDate)
                    error = true;
            }
            if (sermon[0].lienFacebook != lienFacebook) {
                const updateVideo = yield (0, method_1.updateData)("sermon", ["lienFacebook"], ["idSermon"], [lienFacebook, id]);
                if (!updateVideo)
                    error = true;
            }
            if (sermon[0].lienYoutube != lienYoutube) {
                const updateVideo = yield (0, method_1.updateData)("sermon", ["lienYoutube"], ["idSermon"], [lienYoutube, id]);
                if (!updateVideo)
                    error = true;
            }
            if (sermon[0].lienAudio != lienAudio) {
                const updateAudio = yield (0, method_1.updateData)("sermon", ["lienAudio"], ["idSermon"], [lienAudio, id]);
                if (!updateAudio)
                    error = true;
            }
            if (sermon[0].fkPredicateur != predicateur) {
                const updatePred = yield (0, method_1.updateData)("sermon", ["fkPredicateur"], ["idSermon"], [predicateur, id]);
                if (!updatePred)
                    error = true;
            }
            if (error)
                return res.status(400).json({ message: "Erreur survenu lors de la mise à jour" });
            else
                return res.status(200).json({ message: "Modification réussi" });
        }
        else
            return res.status(400).json({ message: "Ce predicateur n'existe pas" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.updateSermon = updateSermon;
const deleteSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params, error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.string().required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    if (yield (0, method_1.isFindColumn)("sermon", ["idSermon"], [id])) {
        if (yield (0, method_1.deleteData)("sermon", ["idSermon"], [id])) {
            return res.status(200).json({ message: "Supression reussi" });
        }
    }
    else {
        return res.status(400).json({ message: "Cette predication n'existe pas" });
    }
});
exports.deleteSermon = deleteSermon;
