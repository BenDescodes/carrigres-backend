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
exports.deleteSermon = exports.updateSermon = exports.createSermon = exports.fetchPasteurOneSermon = exports.fetchAllSermonPasteur = exports.fetchOneSermon = exports.fetchOtherSermon = exports.fetchAllSermon = void 0;
const joi_1 = __importDefault(require("joi"));
const method_1 = require("../helper/method");
const randomstring_1 = __importDefault(require("randomstring"));
const dateConfig_1 = __importDefault(require("../helper/dateConfig"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale("fr");
const fetchAllSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sermon = yield (0, method_1.fetchTableData)("v_sermon_all", "ORDER BY dateSermon DESC");
        if (!sermon.length)
            return res.status(200).json([]);
        const allSermons = yield Promise.all(sermon.map((items) => __awaiter(void 0, void 0, void 0, function* () {
            const predicateur = items.nomPredicateur
                ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                : `${items.nom} ${items.prenom}`;
            const eglise = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres";
            return {
                id: items.idSermon,
                theme: items.theme,
                passage: items.passage,
                dateSermon: (0, dateConfig_1.default)(items.dateSermon),
                titre: items.titre ? items.titre : "",
                predicateur: predicateur,
                eglise: eglise,
                lienFacebook: items.lienFacebook,
                lienFacebook2: items.lienFacebook2,
                lienYoutube: items.lienYoutube,
                vue: items.nbrVue,
            };
        })));
        return res.status(200).json(allSermons);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchAllSermon = fetchAllSermon;
const fetchOtherSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const script = "SELECT * FROM v_sermon_all WHERE nom!=? OR nom is null AND prenom!=? OR prenom is null ORDER BY dateSermon DESC";
        const sermon = yield (0, method_1.personalQueryAsync)(script, ["Kapanga", "Theophile"]);
        if (!sermon.length)
            return res.status(200).json([]);
        const fullSermons = yield Promise.all(sermon.map((items) => __awaiter(void 0, void 0, void 0, function* () {
            const predicateur = items.nomPredicateur
                ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                : `${items.nom} ${items.prenom}`;
            const eglise = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres";
            return {
                id: items.idSermon,
                theme: items.theme,
                passage: items.passage,
                dateSermon: (0, dateConfig_1.default)(items.dateSermon),
                titre: items.titre ? items.titre : "Frère",
                predicateur: predicateur,
                eglise: eglise,
                lienFacebook: items.lienFacebook,
                lienFacebook2: items.lienFacebook2,
                lienYoutube: items.lienYoutube,
                vue: items.nbrVue,
            };
        })));
        return res.status(200).json(fullSermons);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchOtherSermon = fetchOtherSermon;
const fetchOneSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const error = (0, method_1.checkError)(req.params, {
        id: joi_1.default.required(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json({ error });
    try {
        const sermon = yield (0, method_1.fetchTableColumns)("v_sermon_all", ["IdSermon"], [id]);
        console.log(sermon[0]);
        if (!sermon.length)
            return res.status(200).json([]);
        const items = sermon[0];
        const predicateur = items.nomPredicateur
            ? `${items.prenomPredicateur} ${items.nomPredicateur} `
            : `${items.prenom} ${items.nom} `;
        const eglise = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres";
        const oneSermon = {
            id: items.idSermon,
            theme: items.theme,
            passage: items.passage,
            dateSermon: (0, moment_1.default)(items.dateSermon).format("YYYY-MM-DD"),
            dateSermonFront: (0, dateConfig_1.default)(items.dateSermon),
            predicateur: predicateur,
            eglise: eglise,
            lienFacebook: items.lienFacebook,
            lienFacebook2: items.lienFacebook2,
            lienYoutube: items.lienYoutube,
            vue: items.nbrVue,
        };
        return res.status(200).json(oneSermon);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchOneSermon = fetchOneSermon;
const fetchAllSermonPasteur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sermon = yield (0, method_1.fetchTableColumns)("v_sermon_all", ["nom", "prenom"], ["Kapanga", "Theophile"], "ORDER by dateSermon DESC");
        if (!sermon.length)
            return res.status(200).json([]);
        const fullSermons = yield Promise.all(sermon.map((items) => __awaiter(void 0, void 0, void 0, function* () {
            const predicateur = items.nomPredicateur
                ? `${items.nomPredicateur} ${items.prenomPredicateur}`
                : `${items.nom} ${items.prenom}`;
            const eglise = items.eglise ? items.eglise : "Assemblée Chrétienne de Carrigres";
            return {
                id: items.idSermon,
                theme: items.theme,
                passage: items.passage,
                dateSermon: (0, dateConfig_1.default)(items.dateSermon),
                titre: "Pasteur",
                predicateur: predicateur,
                eglise: eglise,
                lienFacebook: items.lienFacebook,
                lienFacebook2: items.lienFacebook2,
                lienYoutube: items.lienYoutube,
                vue: items.nbrVue,
            };
        })));
        return res.status(200).json(fullSermons);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.fetchAllSermonPasteur = fetchAllSermonPasteur;
const fetchPasteurOneSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.fetchPasteurOneSermon = fetchPasteurOneSermon;
const createSermon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { theme, passage, date, lienFacebook, lienYoutube, lienFacebook2, predicateur } = req.body, token = randomstring_1.default.generate(6), error = (0, method_1.checkError)(req.body, {
        theme: joi_1.default.string().required(),
        passage: joi_1.default.string().required(),
        date: joi_1.default.date().required(),
        lienFacebook: joi_1.default.allow(""),
        lienYoutube: joi_1.default.allow(""),
        lienFacebook2: joi_1.default.allow(""),
        predicateur: joi_1.default.string(),
    });
    if (error === null || error === void 0 ? void 0 : error.length)
        return res.status(400).json(error);
    try {
        if (!(yield (0, method_1.isFindColumn)("sermon", ["theme", "passage", "dateSermon"], [theme, passage, date]))) {
            const dataMembre = yield (0, method_1.fetchTableColumns)("membre", ["tkMembre"], [predicateur]);
            const dataPredicateur = yield (0, method_1.fetchTableColumns)("predicateur", ["tkPred"], [predicateur]);
            const fkPred = dataMembre.length ? dataMembre[0].tkMembre : dataPredicateur.length ? dataPredicateur[0].tkPred : null;
            const sermon = yield (0, method_1.createData)("sermon", ["theme", "passage", "dateSermon", "lienFacebook", "lienYoutube", "lienFacebook2", "tkSermon", "fkPredicateur"], ["?", "?", "?", "?", "?", "?", "?", "?"], [theme, passage, date, lienFacebook, lienYoutube, lienFacebook2, token, fkPred]);
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
    const { theme, passage, dateSermon, lienFacebook2, lienFacebook, lienYoutube, predicateur } = req.body;
    const error = (0, method_1.checkError)({ theme, passage, dateSermon, lienFacebook2, lienFacebook, lienYoutube, predicateur }, {
        theme: joi_1.default.string().required(),
        passage: joi_1.default.string().required(),
        dateSermon: joi_1.default.date().required(),
        lienFacebook: joi_1.default.string().allow(""),
        lienYoutube: joi_1.default.string().allow(""),
        lienFacebook2: joi_1.default.string().allow(""),
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
            if (sermon[0].lienFacebook2 != lienFacebook2) {
                const updateVideo2 = yield (0, method_1.updateData)("sermon", ["lienFacebook2"], ["idSermon"], [lienFacebook2, id]);
                if (!updateVideo2)
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
