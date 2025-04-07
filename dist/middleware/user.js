"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const type_1 = require("../types/type");
const auth = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decodeToken = (0, jsonwebtoken_1.verify)(token, type_1.secret);
        req.auth = {
            idUser: decodeToken.idUser,
        };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "vous avez pas le droit d'effectuer cette action" });
    }
};
exports.auth = auth;
